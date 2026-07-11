# Inventory Import Pipeline — Speedway Motors LLC

Autofunds uploads a daily CSV to an SFTP server. A Vercel Cron job downloads it, parses it, and upserts the data into Supabase. The public inventory pages pull live from Supabase.

---

## SFTP Server

| Field       | Value                              |
|-------------|-------------------------------------|
| Host        | 157.230.51.45                       |
| Port        | 22                                  |
| Protocol    | SFTP (SSH File Transfer Protocol)   |
| User        | autofunds-upload                    |
| Chroot      | /home/autofunds-upload              |
| Upload path | /speedwaymotors/inventory/          |
| File name   | daily_inventory.csv                 |

The `autofunds-upload` user is jailed inside `/home/autofunds-upload`. The full server-side path is `/home/autofunds-upload/speedwaymotors/inventory/daily_inventory.csv`, but from SFTP it appears as `/speedwaymotors/inventory/daily_inventory.csv`.

---

## Required Vercel Environment Variables

Set these in the Vercel dashboard under **Settings → Environment Variables**. Never commit real values to the repo.

| Variable                  | Description                                        | Example                     |
|---------------------------|----------------------------------------------------|-----------------------------|
| `SFTP_HOST`               | SFTP server IP                                     | `157.230.51.45`             |
| `SFTP_PORT`               | SFTP port (default 22)                             | `22`                        |
| `SFTP_USERNAME`           | SFTP login user                                    | `autofunds-upload`          |
| `SFTP_PASSWORD`           | SFTP password — **server-side only**               | (from DO droplet setup)     |
| `SFTP_PRIVATE_KEY`        | Optional SSH private key (PEM) instead of password | `-----BEGIN OPENSSH...`     |
| `SFTP_PRIVATE_KEY_PASSPHRASE` | Optional passphrase for encrypted private key  | (if key is encrypted)       |
| `SFTP_REMOTE_DIR`         | Directory on SFTP server                           | `/speedwaymotors/inventory` |
| `SFTP_FILE_NAME`          | File name to download                              | `daily_inventory.csv`       |
| `NEXT_PUBLIC_SUPABASE_URL`| Supabase project URL                               | `https://xyz.supabase.co`   |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key — **server-side only** | (from Supabase dashboard)   |
| `CRON_SECRET`             | Auth secret for the cron endpoint                  | `openssl rand -hex 32`      |
| `INVENTORY_SOURCE`        | Data source for pages                              | `supabase`                  |
| `INVENTORY_API_KEY`       | Auth for `/api/inventory/ingest`                   | (random string)             |

---

## How the Import Works

```
[Autofunds server]
      │ uploads daily_inventory.csv via SFTP
      ▼
[DigitalOcean SFTP droplet: 157.230.51.45]
      │
[Vercel Cron: 0 7 * * * → GET /api/cron/sync-autofunds]
      │ 1. Validates CRON_SECRET
      │ 2. Downloads CSV via ssh2-sftp-client
      │ 3. Parses CSV with parseAutofundsCsv()
      │ 4. Calls importVehicles() → upserts into Supabase inventory table
      │ 5. Marks unseen Autofunds vehicles as inactive
      │ 6. Revalidates Next.js ISR cache for /inventory pages
      ▼
[Supabase: inventory table]
      │
[Next.js: /inventory and /inventory/[slug]]
```

---

## Supabase Schema

The `inventory` table stores all vehicles. Key columns added for the Autofunds pipeline:

| Column        | Type        | Description                            |
|---------------|-------------|----------------------------------------|
| `source`      | text        | Always `'autofunds'` for SFTP imports  |
| `status`      | text        | `'active'` or `'inactive'`             |
| `last_seen_at`| timestamptz | Timestamp of the last import that included this VIN |
| `raw_data`    | jsonb       | Full parsed vehicle object from the CSV |

Apply the migration before first use:

```sql
-- db/migrations/20260530_inventory_autofunds_columns.sql
ALTER TABLE inventory
  ADD COLUMN IF NOT EXISTS source       TEXT NOT NULL DEFAULT 'autofunds',
  ADD COLUMN IF NOT EXISTS status       TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS raw_data     JSONB;
```

---

## Running the Import Manually

### Option A: Trigger the cron endpoint directly

```bash
curl -X GET "https://www.speedwaymotorsllc.com/api/cron/sync-autofunds" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Response:
```json
{
  "ok": true,
  "source": "autofunds",
  "file": "daily_inventory.csv",
  "summary": { "totalRows": 52, "upserted": 52, "skipped": 0, "markedInactive": 1 }
}
```

### Option B: Test script (dry-run, no DB writes)

```bash
# 1. Copy and fill in .env.local
cp .env.example .env.local
# Edit SFTP_HOST, SFTP_PASSWORD, SUPABASE_*, CRON_SECRET, etc.

# 2. Dry-run (downloads from SFTP, parses, prints summary — no DB writes)
npx tsx scripts/test-import-inventory.ts

# 3. Actually write to Supabase
npx tsx scripts/test-import-inventory.ts --import

# 4. Test with a local CSV file (no SFTP needed)
npx tsx scripts/test-import-inventory.ts --local path/to/daily_inventory.csv
npx tsx scripts/test-import-inventory.ts --local path/to/daily_inventory.csv --import
```

---

## Vercel Cron Schedule

`vercel.json` runs the import daily at 07:00 UTC (3 AM ET):

```json
{
  "crons": [
    { "path": "/api/cron/sync-autofunds", "schedule": "0 7 * * *" }
  ]
}
```

Vercel automatically sends `Authorization: Bearer <CRON_SECRET>` with each cron call.

---

## Troubleshooting

| Symptom | Check |
|---------|-------|
| `SFTP fetch failed: connect ECONNREFUSED` | Verify the droplet is running and port 22 is open |
| `No vehicles parsed from feed` | The CSV may be empty or headers don't match — check `lib/feed/autofunds-parser.ts` column map |
| `Supabase insert error 42703` | A column is missing — run the latest migration |
| Inventory pages show old data | ISR cache may be stale — trigger `/api/cron/sync-autofunds` manually |
| `Unauthorized` on cron endpoint | `CRON_SECRET` env var doesn't match the header |

---

## CSV Header Mapping

The parser (`lib/feed/autofunds-parser.ts`) maps these exact Autofunds CSV headers:

| CSV Column          | DB Column        |
|---------------------|------------------|
| `StockNumber`       | `stock_number`   |
| `VIN`               | `vin`            |
| `Year`              | `year`           |
| `Make`              | `make`           |
| `Model`             | `model`          |
| `Trim`              | `trim`           |
| `Condition`         | `condition`      |
| `InternetSpecial`   | `price`          |
| `InternetReduced`   | `price` (fallback) |
| `Mileage`           | `mileage`        |
| `FuelType`          | `fuel_type`      |
| `Transmission`      | `transmission`   |
| `Body`              | `body_type`      |
| `DoorsCount`        | `doors`          |
| `EngineDescription` | `engine`         |
| `ExteriorColor`     | `exterior_color` |
| `InteriorColor`     | `interior_color` |
| `Comments`          | `description`    |
| `PhotoUrls`         | `images` (pipe-delimited) |
| `Options`           | `features` (pipe-delimited) |
| `DriveTrain`        | `drivetrain`     |

If Autofunds changes headers, update the `COL` map in `lib/feed/autofunds-parser.ts`.

## Image URL handling

All vehicle image URLs pass through `normalizeVehicleImageUrl()` in
`lib/images/vehicle-image-url.ts` — at import time (Autofunds parser) and at
read time (`lib/data/inventory-source.ts`). It trims whitespace/quotes,
decodes basic HTML entities, resolves protocol-relative URLs, upgrades
http→https, rejects unsafe or unapproved hosts, and rewrites decommissioned
`InvImg*.autofunds.net` hosts to `images.autofunds.net` (AutoFunds retired
the InvImg* hosts in June 2026; the same paths are served by the new host).
The approved-host list mirrors `images.remotePatterns` in `next.config.ts` —
update both together when adding a CDN.

## Slug stability

The `inventory` table has a UNIQUE index on `slug` while the daily sync
upserts on `vin`. `resolveSlug()` in `lib/server/importVehicles.ts` therefore
keeps the existing slug for VINs already in the DB and dedupes new slugs
against every existing row (including sold/inactive ones). Without this, a
regenerated slug colliding with a sold row aborts the whole upsert batch —
this took the sync down between 2026-06-30 and 2026-07-11 and left stale
(dead) image URLs in the DB. If a batch still fails, rows are retried
individually so one bad row can't sink the sync.

## Repairing legacy image hosts

`scripts/repair-image-hosts.ts` rewrites `InvImg*.autofunds.net` →
`https://images.autofunds.net/` in `thumbnail_url` and `images[].url`.
It is idempotent, changes hostnames only (paths/query/ordering untouched),
deletes nothing, and logs counts only.

```bash
npx tsx scripts/repair-image-hosts.ts          # dry-run (default)
npx tsx scripts/repair-image-hosts.ts --apply  # write changes
```

Requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
(read from `.env.local`). This repair was applied to the production DB on
2026-07-11 (110 rows, 4,552 image entries); the script remains for any
environment still holding legacy hosts.
