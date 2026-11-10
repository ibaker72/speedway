# Vehicle detail page upgrade — deployment runbook (2026-11)

Branch: `ccr-6d5320ff-9db63b`. Nothing has been applied to production; no
production data was written during development (only read-only `SELECT`s).

## Order of operations

1. **Review and apply the schema migration** (additive; safe to re-run):
   `db/migrations/20261109_inventory_descriptions_and_specs.sql`
   - Adds nullable provenance/spec columns and a CHECK constraint on
     `description_source`; drops the invented `DEFAULT 'FWD'` /
     `'Automatic'` / `'Gasoline'` defaults and NOT NULLs on spec columns
     (the live table is already nullable; this aligns the repo schema).
   - Verify: `SELECT column_name FROM information_schema.columns WHERE
     table_name = 'inventory' AND column_name IN ('specs', 'description_source', 'sync_hash');`
     returns 3 rows.

2. **Deploy the branch.** If the code ships before step 1, the nightly sync
   still works in `legacy` mode (its JSON response shows `"schemaMode":
   "legacy"`), and pages normalize specs at render time from `raw_data`, so
   the Wrangler already shows 4WD.

3. **Backfill (dry run first):**
   ```bash
   npx tsx scripts/backfill-vehicle-descriptions.ts --verbose        # review
   npx tsx scripts/backfill-vehicle-descriptions.ts --apply          # write
   npx tsx scripts/backfill-vehicle-descriptions.ts                  # expect 0 changes
   ```
   Expected on the 2026-11-09 snapshot: ~84 active rows changed (specs
   column on all; generated descriptions for the 48 without one plus the
   short-slogan rows; spec corrections such as the Wrangler's
   drivetrain). Manual descriptions: none detected at audit time.

4. **Trigger one sync** (or wait for 07:00 UTC):
   `curl -H "Authorization: Bearer $CRON_SECRET" https://www.speedwaymotorsllc.com/api/cron/sync-autofunds`
   The first run after deploy updates every row once (no `sync_hash` yet)
   and re-parses the raw feed with the fixed parser (e.g. hybrids that were
   stored as "electric"). A second run should report `updated: 0`.

5. **Optional:** review and apply
   `db/migrations/20261109b_inventory_restore_date_added.sql` to restore
   `date_added` from `created_at` (it was reset by every past sync). Preview
   query is in the file.

6. **Optional AI rewrite** (costs money; off by default): see
   `docs/inventory/vehicle-descriptions.md` → "Optional AI rewrite".

## Post-deploy checks

- `/inventory/2012-jeep-wrangler-unlimited-4wd-4dr-sport`: drivetrain
  "Four-wheel drive (4WD)", no transmission row (feed says automatic,
  decoded options say 6-speed manual), overview text present.
- A sold vehicle URL returns HTTP 404 with a single `noindex` robots tag.
- Submit a test "Check Availability" inquiry and a shipping quote; confirm
  the sales email arrives and a row appears in `public.leads` with
  `source = 'vehicle-inquiry'` / `'shipping'`. **The `leads` table had zero
  rows at audit time** — if no row appears, check
  `SUPABASE_SERVICE_ROLE_KEY` in Vercel and the server logs for
  `[leads] failed to store`.
- Sync response: `specConflicts` > 0 is expected (data-quality signal, not
  an error). Conflicts are listed per vehicle in `inventory.specs->conflicts`:
  ```sql
  SELECT year, make, model, vin, specs->'conflicts'
    FROM inventory WHERE NOT is_sold AND jsonb_array_length(specs->'conflicts') > 0;
  ```
  Fixing the source data in Autofunds (e.g. setting manual transmissions
  correctly) clears them on the next sync.

## Production state (2026-11-10)

- Recovery points (private schema `backup_20261110`, not exposed by the Data
  API; no anon/authenticated grants):
  - `backup_20261110.inventory` — taken before the 2026-11-10 07:00 UTC sync;
    differs from the next one only in the four timestamps that sync stamps.
  - `backup_20261110.inventory_pre_migration` — exact copy (checksum-verified,
    312 rows) taken immediately before the migrations below.
- Applied: `20261109_inventory_descriptions_and_specs.sql` and
  `20261109b_inventory_restore_date_added.sql` (310 rows; active vehicles
  now span 44 distinct dates instead of one sync timestamp).
- Production drift: the live `inventory_search_update()` trigger also sets
  `updated_at` and `date_modified` to `now()` on every UPDATE. The sync
  therefore writes nothing at all for unchanged rows.
- **Deploy the new code before the next 07:00 UTC sync**: the old importer
  resets `date_added` on every run.

## Rollback

**Application:** Vercel → Deployments → promote the previous production
deployment (instant rollback). The old code runs fine with the new columns
(it ignores them) but will reset `date_added` again on its next sync.

**Data:** restore every original column from the exact snapshot (rows
inserted after the snapshot are kept; the new columns are left as they are):

```sql
DO $$
DECLARE cols text;
BEGIN
  SELECT string_agg(format('%I = b.%I', column_name, column_name), ', ')
    INTO cols
    FROM information_schema.columns
   WHERE table_schema = 'backup_20261110'
     AND table_name = 'inventory_pre_migration'
     AND column_name <> 'id';
  EXECUTE format(
    'UPDATE public.inventory i SET %s FROM backup_20261110.inventory_pre_migration b WHERE b.id = i.id',
    cols);
END $$;
```

(The production trigger stamps `updated_at`/`date_modified` with the restore
time.) The snapshot schema can be dropped once the release is verified:
`DROP SCHEMA backup_20261110 CASCADE;` — only with explicit approval.
