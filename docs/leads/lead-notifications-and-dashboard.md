# Website leads: notifications, dashboard, and recovery (2026-11)

Every website form (vehicle inquiry, financing, shipping, contact, test
drive, trade-in, sell my car, inventory alerts) goes through
`submitLead()` (`lib/leads/submit.ts`):

1. **Store** the lead in `public.leads` (server-generated id; the insert is
   retry-safe — a repeated insert is ignored, never duplicated).
2. **Notify** the sales inbox through the tracked delivery job
   (`lib/leads/notifications.ts`). A failure never loses the lead: it stays
   `pending` and is retried.
3. If storing fails, the sales inbox is emailed directly so the inquiry is
   not lost. The customer sees an error (with the phone number) only when
   both steps fail.

Customers never receive an email from these flows.

## Notification states

| `notification_status` | Meaning | What happens next |
|---|---|---|
| `pending` | Not accepted yet | Retried by `/api/cron/lead-notifications` (every 10 min) at `notification_next_attempt_at` |
| `sending` | An attempt holds a 2-minute lease | If the process dies, the lease expires and the retry job takes over |
| `sent` | **Resend accepted** the email | Delivery events (delivered/bounced) arrive via the webhook |
| `failed` | Retries exhausted, bounced, or a lead from before tracking | Shown in red on the dashboard; staff can press **Send sales notification** |

Retry schedule after a failed attempt: 2 min, 10 min, 30 min, 2 h, 6 h,
12 h (7 attempts over about 21 hours). When the last attempt fails the log
gets `[leads] ALERT notification failed permanently: lead=<id> …` (no
customer data in logs) and the dashboard shows a red banner.

**Duplicates:** each attempt claims the lead with a conditional update on
the attempt counter (two workers cannot both send), and a retry after an
*ambiguous* failure (network error, Resend 5xx — the email might have been
accepted) reuses that attempt's `Idempotency-Key`, so Resend drops the
repeat. A definitive rejection (e.g. `validation_error`) gets a new key.

Every call to Resend is a row in `lead_notification_attempts` (outcome,
Resend error code, message id, delivery status).

## Email setup — required manual steps

Production currently fails every notification with:

> `validation_error: The speedwaymotorsllc.com domain is not verified`

The sender is `LEAD_FROM_EMAIL` or, if unset, `leads@speedwaymotorsllc.com`.
DNS for `speedwaymotorsllc.com` is hosted by **Vercel DNS** (authoritative
nameservers `ns1/ns2.vercel-dns.com`, verified 2026-11-22). The zone has no
MX, SPF, DKIM or DMARC records today, so nothing existing is overwritten.

1. **Resend → Domains → Add domain** → `speedwaymotorsllc.com` (choose the
   region your Resend account uses).
2. Resend shows the records to add — typically an MX and an SPF TXT record
   on a `send` subdomain and a DKIM TXT record at `resend._domainkey`. Copy
   the **exact** names and values from Resend (the DKIM key is unique to your
   account; do not use values from anywhere else).
3. **Vercel → Domains → speedwaymotorsllc.com → DNS Records → Add** each
   record exactly as shown. These sit on subdomains and do not affect the
   website or any inbox.
4. Back in Resend, click **Verify**. It usually completes within minutes.
5. Optional but recommended: add a DMARC record
   (`_dmarc` TXT, e.g. `v=DMARC1; p=none;`) to improve inbox placement.
6. Confirm Vercel env vars (Production): `RESEND_API_KEY`,
   `LEAD_NOTIFICATION_EMAIL` (the sales inbox), and `LEAD_FROM_EMAIL` if you
   want a sender other than `leads@speedwaymotorsllc.com` (it must be on the
   verified domain).

After verification, every lead still `pending` is sent automatically by the
retry job. Leads marked `failed` (including all leads from before
2026-11-22) are **not** re-sent automatically — open them in the dashboard
and press **Send sales notification** if staff want the email.

### Delivery tracking (optional)

Resend **acceptance** is not delivery. To record delivered/bounced:

1. Resend → Webhooks → Add endpoint
   `https://www.speedwaymotorsllc.com/api/webhooks/resend`, events
   `email.sent`, `email.delivered`, `email.delivery_delayed`,
   `email.bounced`, `email.complained`, `email.failed`.
2. Copy the signing secret (`whsec_…`) into Vercel env
   `RESEND_WEBHOOK_SECRET` (Production) and redeploy.

The endpoint verifies the Svix signature and timestamp (±5 min), ignores
repeated deliveries of the same event, and never moves a delivery state
backwards. A bounce marks the lead's notification `failed`.

## Website Leads dashboard

`/admin/leads` (same staff password as the Deal Desk):

- Summary: New, Awaiting follow-up (New + In Progress), Contacted,
  Appointments, Sold, Failed notifications.
- Filters: status, inquiry type, sales-email status, date range, vehicle;
  search by name, email, phone (any formatting), VIN or stock number.
- List shows contact details, vehicle (title, stock, VIN), date, status and
  email status. **Financing fields are never in the list** — only on the
  lead's detail page.
- Detail page: full inquiry, vehicle, shipping destination, financing
  details (finance leads only), consent, attribution, notification history,
  status changes, notes, and **Send sales notification**.
- Status changes and notes are recorded in `lead_activity` with the name
  typed in "Your name" (there are no per-user accounts; see follow-ups).

Security: every page and API checks the staff session server-side; writes
also require a same-origin request. The session cookie is a signed,
expiring token (8 h) — no longer the password itself, so existing sessions
must sign in again once. Login is rate-limited per IP. Data is read with
the service-role key on the server only; the lead tables have RLS enabled
with no policies and no anon/authenticated grants.

Optional env: `ADMIN_SESSION_SECRET` (signs sessions; defaults to the admin
password — changing either signs everyone out).

## Recovering the missed leads

Before this release no lead email was ever delivered. As of 2026-11-22 the
only real customer lead is the financing application from 2026-11-16
11:58 UTC (`0a745df5-de8e-43ff-9bd8-1bea393e7fd2`); the two leads from
2026-11-10 are labelled deployment tests. To list leads whose email failed:

```sql
SELECT id, created_at, source, notification_status, notification_last_error
  FROM public.leads WHERE notification_status <> 'sent' ORDER BY created_at DESC;
```

or open `/admin/leads?notification=failed`.

## Migration and recovery

`db/migrations/20261122_lead_management_and_notifications.sql` is additive:
new nullable/defaulted columns on `leads`, three new tables, two CHECK
constraints, one partial index. It deletes nothing and is safe to re-run.

- Backup taken before applying: `backup_20261122.leads` (private schema,
  row count + checksum verified).
- Older application code ignores the new columns and tables.
- To undo the constraints only (if ever needed):
  `ALTER TABLE public.leads DROP CONSTRAINT leads_status_check, DROP CONSTRAINT leads_notification_status_check;`
- Data restore of the original columns, if ever needed (does not delete
  leads created later):

```sql
UPDATE public.leads l
   SET source = b.source, name = b.name, email = b.email, phone = b.phone,
       payload = b.payload, status = b.status, created_at = b.created_at, notified_at = b.notified_at
  FROM backup_20261122.leads b
 WHERE b.id = l.id;
```

Dropping the new tables or the backup schema is destructive and needs
explicit approval.

## Supabase "fetch failed" errors

Diagnosis (2026-11-22): about 333 `TypeError: fetch failed` errors in 7 days
(≈48/day) across many pages and regions. In the same period Supabase served
every inventory request it received (4,302 in 24 h, no 5xx/429, slowest
0.8 s). The failures never reach Supabase: `other side closed` with the
full request written and 0 bytes read, `write ETIMEDOUT`, and
`ECONNRESET`/`terminated` while reading — typically 2–3 parallel requests
of one render failing together. That is the signature of pooled keep-alive
connections that went stale while the serverless instance was idle.

Mitigation (`lib/server/resilient-fetch.ts`, used by inventory reads and
`lib/supabase.ts`):

- Up to 2 quick retries (full-jitter backoff, 150 ms base, 1.5 s cap) for
  connection errors, per-attempt timeouts (8 s), and 408/429/5xx; never for
  other 4xx (bad query, invalid key, permission denied). Writes retry only
  when they are idempotent.
- The response body is read inside the retry loop (resets can happen
  mid-body).
- Circuit breaker: after 5 exhausted failures within 60 s an instance stops
  retrying for 30 s, so an outage does not multiply traffic.
- Logs: `[supabase] <label>: attempt N failed (<code>); retrying`,
  `recovered on attempt N`, `failed after N attempts`. No URLs or keys.

Behaviour changes:

- Primary inventory pages (`/inventory`, make pages, `/commercial`,
  `/specials`, `/compare`, vehicle pages, sitemap) no longer render an empty
  "0 vehicles" page or a false "no longer available" 404 when Supabase is
  unreachable. Cached (ISR) pages keep serving the last good version;
  otherwise the error page offers **Try again** (which now really refetches)
  and the phone number. Sold/missing vehicles still return 404.
- Secondary sections (home page strips, related vehicles, city pages) render
  without inventory, as before.

Monitoring: compare the Vercel runtime-error group `TypeError: fetch failed`
before/after; expect retries (`[supabase] … retrying` warnings) to be
common and `failed after` errors to be rare.
