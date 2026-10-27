# `leads` migration — production readiness audit

Date: 2026-10-27 · Project: Supabase `ynrzmmbywnrifkhdltvz` (Pro plan, Postgres 17.6) · Migration: `db/migrations/20261026_leads_table_rls.sql`

**Recommendation: GO for the hardened migration**, after the three pre-flight items below. The earlier (unhardened) version of the file is superseded. Nothing in this audit changed production; all live checks were read-only queries.

## Pre-flight (must be done before running)

1. Confirm or take a backup (see "Backup").
2. Confirm `RESEND_API_KEY` and `LEAD_NOTIFICATION_EMAIL` are set for **Production** in Vercel (Settings → Environment Variables). The site currently running in production (`main` @ `225d6e0`) will start saving leads as soon as the table exists, and nothing in the app displays the `leads` table — email is the only way staff will see them. If the variables are missing, either add them first or check the table daily until they are.
3. Run the pre-check query below and confirm it returns `NULL`.

## Findings

| # | Check | Result |
|---|---|---|
| 1 | `leads` exists? | **No.** No table, view, or index named `leads` in any schema. No `supabase_migrations` history table — earlier migrations were applied manually. |
| 2 | Leads stored elsewhere? | **No.** Only lead-like table is `deal_desk_leads` (2 rows, both 2026-07-17; written by Build My Deal). No `auth.users`. Production's old code inserted before emailing, so failed submissions were neither saved nor emailed, and PostgREST's "relation does not exist" error carries no form data, so nothing is recoverable from logs. Vercel shows **0 errors on any lead route in the last 7 days** (the old code logs every failed insert), so no submissions were lost in that window; older losses can't be measured (log retention). |
| 3 | Schema compatibility | **Compatible.** Every write path — the 6 routes live on `main` and the 7 on the branch (incl. shipping) — goes through `lib/leads/store.ts` (identical on both) and sends `source` (always non-empty), `name`/`email`/`phone` (text or null), `payload` (JSON object), `status = 'new'`, `created_at` (ISO). The Deal Desk store's columns match live `deal_desk_leads`/`deal_desk_events` exactly. The service-role key is present in production (daily inventory sync and Deal Desk event inserts through 2026-10-27 both require it). |
| 4 | Default privileges | Supabase grants `anon` and `authenticated` **all** privileges (incl. `SELECT`, `UPDATE`, `DELETE`, `TRUNCATE`) on every new `public` table. RLS blocks row access but **not `TRUNCATE`**. Verified locally: with the previous file, `anon` could `TRUNCATE`. Not reachable through the REST/GraphQL APIs today, but the hardened file revokes these grants. |
| 5 | Anonymous access to customer data (new table) | With the hardened file, `anon` and `authenticated` get "permission denied" for select/insert/update/delete/truncate; `service_role` (BYPASSRLS) keeps full access. Browsers never receive a Supabase key: all writes go through Next.js routes using the server-only service-role key (no client component imports a Supabase module; no Supabase Auth usage). |
| 6 | Anonymous access to customer data (existing tables) | **Pre-existing issue, separate fix.** `deal_desk_leads` and `deal_desk_events` have policies allowing any `authenticated` user to read and update every row, and `anon` to insert. The app never uses these (it writes with `service_role`). Exploitable only with the anon key **and** Supabase Auth sign-ups enabled (not checkable via SQL; 0 users exist). Fix: "Optional migration B" below. |
| 7 | Email fallback (branch code) | Verified with mocked Resend: missing config → `false`; Resend `{ error }` (e.g. unverified domain) → `false`; network throw → `false`; accepted → `true`. Outcome matrix: stored+emailed → 200; stored only → 200 (lead is safe in DB but no one is alerted — needs monitoring); emailed only → 200; neither → 500 with the phone number. No false success when both fail. "Accepted by Resend" is not proof of inbox delivery (bounces/spam are not tracked). Production's old `notifyLead` ignores Resend errors entirely, so after the migration the live site reports success whenever the row is saved. |
| 8 | Duplicates | No idempotency key or unique constraint; a retry after a network error creates a second row and email. Submit buttons disable while sending. Low impact; recommended follow-up: client-generated submission ID with `ON CONFLICT DO NOTHING`. |
| 9 | Spam | Live `main`: **no** rate limit, honeypot, or field caps on lead routes. Today those requests fail; after the migration each valid POST creates a row and an email. Observed traffic is ~zero (finding 2), so near-term risk is low; mitigate with a Vercel WAF rate-limit rule on `POST /api/*` and by deploying the branch (per-IP limit, honeypot, caps, source allowlist). Vercel overwrites `X-Forwarded-For`, so the limiter key can't be forged. Direct REST inserts into `leads` are impossible after this migration. |
| 10 | Locking / downtime | Creates new objects only; no locks on existing tables. Runs in milliseconds. One transaction: any failure rolls back everything (verified). |
| 11 | Security advisor | Only 2 pre-existing warnings (`set_updated_at`, `inventory_search_update` have a mutable `search_path`). Nothing lead-related. |

Local verification (PGlite with Supabase roles and the production default-privilege ACL recreated): hardened file applied twice without error; compatible on top of `20260404_leads.sql`; aborts with no partial changes if an incompatible `leads` table exists; rollback statement restores the prior state; `service_role` insert in the app's exact row shape succeeds.

## Exact SQL

Run in Supabase Dashboard → SQL Editor (runs as `postgres`, the owner of all existing tables), one block at a time.

**1. Pre-check** — expect `NULL`:

```sql
SELECT to_regclass('public.leads') AS leads_table;
```

**2. Migration** — the full contents of `db/migrations/20261026_leads_table_rls.sql`:

- `BEGIN … COMMIT` — all-or-nothing.
- `CREATE TABLE IF NOT EXISTS public.leads (...)` — the table the app writes to; identical to `20260404_leads.sql`.
- `DO $$ … $$` — aborts and rolls back if a pre-existing `leads` table lacks any required column.
- 4 × `CREATE INDEX IF NOT EXISTS` — source, status, created_at DESC, email (plus the primary key on `id`).
- `ALTER TABLE … ENABLE ROW LEVEL SECURITY` — with no policies, the Data API denies `anon`/`authenticated` all row access.
- `REVOKE ALL … FROM PUBLIC, anon, authenticated` — removes Supabase's automatic grants (incl. `TRUNCATE`); hides the table from anonymous GraphQL introspection.
- `GRANT SELECT, INSERT, UPDATE, DELETE … TO service_role` — explicit, so the app keeps working even if default privileges change.
- `COMMENT ON TABLE` — marks the table as PII.
- `NOTIFY pgrst, 'reload schema'` — makes the table visible to the REST API immediately (the `pgrst_ddl_watch` event trigger also does this).

**3. Post-check** — expect `rls_enabled = true`, `policies = 0`, 5 indexes, `public_grants = NULL`:

```sql
SELECT c.relrowsecurity AS rls_enabled,
       (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'leads') AS policies,
       (SELECT string_agg(indexname, ', ' ORDER BY indexname) FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'leads') AS indexes,
       (SELECT string_agg(grantee || ':' || privilege_type, ', ' ORDER BY grantee, privilege_type)
          FROM information_schema.role_table_grants
         WHERE table_schema = 'public' AND table_name = 'leads' AND grantee IN ('anon', 'authenticated', 'PUBLIC')) AS public_grants
  FROM pg_class c
 WHERE c.oid = 'public.leads'::regclass;
```

**4. Anonymous access check** — expect `ERROR: permission denied for table leads` (the transaction changes nothing):

```sql
BEGIN;
SET LOCAL ROLE anon;
SELECT count(*) FROM public.leads;
ROLLBACK;
```

**5. Smoke test (creates one test lead)** — submit the production contact form with name `TEST please ignore`, confirm the row and the email, then:

```sql
DELETE FROM public.leads WHERE name = 'TEST please ignore';
```

**Monitoring** — leads saved in the last day (run daily until notification is confirmed working):

```sql
SELECT created_at, source, name, email, phone FROM public.leads
 WHERE created_at > now() - interval '1 day' ORDER BY created_at DESC;
```

## Backup

The migration only adds objects, but take a snapshot first:

1. **Automatic backups (Pro: daily, 7-day retention).** Dashboard → Database → Backups → confirm the latest backup is from the last 24 hours. Point-in-time recovery is a paid add-on; check whether it is enabled on the same page.
2. **Manual logical backup (recommended, ~21 MB database).** Copy the **Session pooler** connection string from Dashboard → Connect, then with a Postgres 17 client:
   ```bash
   export DB_URL='postgresql://postgres.ynrzmmbywnrifkhdltvz:<DB_PASSWORD>@<session-pooler-host>:5432/postgres'
   pg_dump "$DB_URL" --schema=public --format=custom --no-owner --file "speedway-public-$(date +%Y%m%d-%H%M).dump"
   pg_restore --list speedway-public-*.dump | head     # sanity check
   ```
   or `supabase db dump --db-url "$DB_URL" -f schema.sql && supabase db dump --db-url "$DB_URL" --data-only -f data.sql`. The dump contains customer PII (`deal_desk_leads`); store it encrypted and delete it when no longer needed.

## Rollback

- **Failure during the migration:** nothing to do — the transaction rolls back automatically.
- **Table not visible to the API after success:** run `NOTIFY pgrst, 'reload schema';` before anything else.
- **Full rollback before any real leads arrive:**
  ```sql
  DROP TABLE IF EXISTS public.leads;   -- also removes its indexes, grants, and comment
  ```
  Effect: forms return to today's failing state.
- **After real leads exist:** export first (Table Editor → `leads` → Export to CSV, or `\copy (SELECT * FROM public.leads ORDER BY created_at) TO 'leads-export.csv' WITH CSV HEADER`), then drop only if truly required — dropping deletes customer inquiries. Prefer fixing forward.
- Never resolve an access problem by disabling RLS or granting `anon` access.
- The app deploy is independent: Vercel → Deployments → promote `dpl_GGJ7bHqZyrz4TmrCkMCkSKZQ68op` (current production) for an instant rollback.

## Optional migration B — lock down Deal Desk tables (separate approval)

Safe for the app: Build My Deal, the tracker, and the admin dashboard all use `service_role`, which bypasses RLS.

```sql
BEGIN;
DROP POLICY IF EXISTS "authenticated can read deal desk leads"    ON public.deal_desk_leads;
DROP POLICY IF EXISTS "authenticated can update deal desk leads"  ON public.deal_desk_leads;
DROP POLICY IF EXISTS "public can insert deal desk leads"         ON public.deal_desk_leads;
DROP POLICY IF EXISTS "authenticated can read deal desk events"   ON public.deal_desk_events;
DROP POLICY IF EXISTS "authenticated can update deal desk events" ON public.deal_desk_events;
DROP POLICY IF EXISTS "public can insert deal desk events"        ON public.deal_desk_events;
REVOKE ALL ON TABLE public.deal_desk_leads, public.deal_desk_events FROM PUBLIC, anon, authenticated;
COMMIT;
```

Also: since the site doesn't use Supabase Auth, turn off **Authentication → Sign In / Providers → Allow new users to sign up**.

## Follow-ups (code, not blocking)

- Set `notified_at` when the email succeeds so unnotified leads can be queried.
- Redact database error details before logging in `lib/leads/submit.ts` (error text can echo row values on constraint violations; none are possible with this schema today).
- Submission idempotency key (finding 8); Vercel WAF rate limit (finding 9); show `leads` in the Deal Desk dashboard.
