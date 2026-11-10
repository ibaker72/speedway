# Vehicle detail page audit — root causes (2026-11-09)

Phase 1 of the vehicle detail page (VDP) upgrade. Every finding below was
checked against the code **and** against production data with read-only
`SELECT` queries on the `speedway` Supabase project (no writes were made).
Snapshot: 84 active vehicles, 228 sold/inactive, last sync 2026-11-09 07:00 UTC.

## 1. "No description available for this vehicle."

**48 of 84 active vehicles (57%)** render this message.

| Hypothesis | Verdict | Evidence |
|---|---|---|
| 1. Missing from the Autofunds feed | **Root cause** | For all 48, `raw_data.description` (the parser's copy of the CSV `Comments` column) is empty too. The feed sends no comments for these vehicles. |
| 2. Present but not imported | No | The 36 rows with a description have `description = raw_data.description` exactly. `Comments` → `description` is mapped and imported. |
| 3. Stored under a different field | No | `raw_data` keys checked; no other text field (`title` is empty on all rows; `options` jsonb is empty; `features` holds the Options list). |
| 4. Not rendered correctly | **Contributing** | `VehicleDetailTabs` prints the fallback sentence whenever `description` is empty. Nothing generates a description from the data we do have. |
| 5. Overwritten during sync | Not observed, but **latent** | Column equals raw on every row, so nothing was lost *today*. But `importVehicles.toRow()` writes `description: v.description ?? null` on every daily upsert, so any description staff type into Supabase is erased by the next 07:00 sync. |

Also found: some "present" descriptions are not usable as an overview — the
shortest are `"CASH DEAL ONLY !."` (17 chars) and `"THE PRICE YOU SEE IS
THE PRICE YOU PAY!."` (40 chars). Those are dealer notes, not descriptions.
No description references a VIN other than its own vehicle's (checked with a
VIN regex across all descriptions).

## 2. 2012 Jeep Wrangler Unlimited Sport (VIN 1C4HJWDG3CL174156) shows FWD

Stored row: `drivetrain = 'FWD'`, `raw_data.drivetrain = null`,
`trim = '4WD 4dr Sport'`, and the Options list contains both
`"Four Wheel Drive"` and `"Command-Trac shift-on-the-fly 4WD system"`.
The VIN itself is valid (check digit 3 matches).

Root cause — two defaults that invent a value when the feed's `DriveTrain`
cell is blank:

1. `lib/feed/autofunds-parser.ts` `normalizeDrivetrain()` returns `"FWD"` for
   anything that is not an exact match (`"4x4/4-wheel drive"`,
   `"Four-Wheel Drive"`, `"Part-Time 4WD"` … all become FWD).
2. `lib/server/importVehicles.ts` `toRow()` writes `v.drivetrain ?? "FWD"` when
   the cell is blank — this is what hit the Jeep. The same default exists in
   `/api/inventory/ingest`, `scripts/import-csv.ts`, the read-side
   `mapDrivetrain()`, and the original migration (`DEFAULT 'FWD'`).

A second vehicle has the same defect: 2010 Honda Odyssey
(5FNRL3H43AB092425) — blank feed value stored as FWD. (It happens to be
correct, by luck; its Options say "Front Wheel Drive".) All other 82 rows have
a feed drivetrain that agrees with their Options tokens.

## 3. Other specification defects found in production

| Field | Defect | Affected (active) |
|---|---|---|
| Fuel | Parser checks `"electric"` before `"hybrid"`, so `"Gas/Electric Hybrid"` and `"Gasoline/Mild Electric Hybrid"` become **electric**. Rows marked electric include a 2023 Audi A5 45 TFSI, a 2023 Toyota Camry SE, and Honda CR-V/Accord **Hybrids**. | 6 |
| Fuel | Stored **diesel** while the Options say `"Gasoline Fuel"` and the engine is gasoline-only: 2021 GMC Yukon Denali 6.2L V8, 2022 Jeep Gladiator 3.6L V6. Raw feed text was not preserved, so the original value can't be recovered — this must be treated as contradictory. | 2 |
| Fuel | Unknown values default to `"gasoline"`/`"Gasoline"`. | — |
| Transmission | The feed says `Automatic` for **all 84**, but 7 vehicles' Options say "6-Speed Manual" — including a 2020 Honda Civic Si Coupe whose *trim is literally "Manual"*, a 2018 Challenger T/A Plus (Tremec 6MT), and four Wranglers/Gladiator. The feed column is unreliable; manual/automatic is contradictory for these. | 7 |
| Body | Unknown body text defaults to `"sedan"`: a 2019 Freightliner Cascadia semi tractor is listed as a **sedan**. `"2dr Hatchback"` would become coupe; `"Crew Cab"` would become sedan. | 1+ |
| Body (read side) | `mapBodyType()` tests `includes("car")` first, so any raw value like "Cargo Van" maps to sedan. | latent |
| Engine | Feed text is unformatted (`"2 4 Cylinder Engine"`, `"14.9 Straight 6 Cylinder Engine"`). | 84 |
| Colors | Suffix noise, e.g. interior `"Black Interior"`. | some |
| Model | Double spaces / shouting, e.g. `"TRANSIT AWD  T-350 HD HIGHROOF REEFER VAN"`. | some |
| Price | A 2024 Honda Accord has price 0 (already shown as "Call for Price"; correct). | 1 |
| Mileage | Missing mileage is stored as 0 (`parseInt(...) \|\| 0`). None today. | 0 |
| VIN / stock | All 84 VINs are well-formed; no blank stock numbers. No validation exists. | 0 |
| Raw data | `raw_data` stores the *already-normalized* parse output, not the CSV cells, so the original `DriveTrain`/`FuelType`/`Body` text is lost and mis-normalizations can't be audited or repaired from the database. | all |

## 4. Sync defects (inventory cron)

- **`date_added` is reset on every sync.** `toRow()` sends `date_added: now`
  in each daily upsert. All 84 active rows have `date_added = 2026-11-09
  07:00:07` while `created_at` spans 44 different days. "Newest" sorting and
  new-arrival logic are meaningless as a result.
- **Every row is rewritten every day** (`date_modified: now` on all rows),
  so sitemap `lastmod` is "today" for every vehicle, every day — an
  inaccurate freshness signal.
- No guard against a truncated feed: a partial CSV would mark the rest of the
  inventory as sold.

## 5. Mobile layout

On phones the DOM order is breadcrumb → gallery → tabs (description/specs/
features) → VIN → **title and price** → actions. The title (`<h1>`) and price
sit below the entire tabbed details card, so a shopper scrolls past the
description before learning the price. Spec values are shown even when they
are defaults (e.g. FWD). The sticky mobile bar (`StickyMobileCTA`, 3.25rem,
fixed bottom) has no matching bottom padding, so it covers the end of every
page on phones.

## 6. Lead capture

- VDP actions: "Call", Carfax/CarGurus links, "Get Pre-Approved" (links to
  `/finance` without vehicle context), a collapsed test-drive form, and a
  link-out to the shipping page. There is no availability or question form
  on the VDP.
- The test-drive lead stores `vehicleId` and title from **client input** only
  (no VIN/stock, no attribution). The shipping workflow is solid: it resolves
  the vehicle server-side and stores VIN, stock number, consent text and
  attribution — but not the vehicle `id`.
- The production `leads` table currently has **zero rows**. Leads may only be
  reaching email (`submitLead` sends the email even when the insert fails);
  this should be checked after deploy (see the deployment steps in the final
  report).

## 7. SEO

Already in place from the October SEO work: canonical URLs, Open Graph,
`Car` + `Offer` JSON-LD, breadcrumbs, sold vehicles return 404 + noindex
(`notFound()` runs before any streaming boundary, so the status really is
404), sitemap excludes sold vehicles. Gaps: the generic description template
is the same for every vehicle apart from name/mileage/price; JSON-LD
publishes the bogus FWD/electric/diesel values; `driveWheelConfiguration`
uses free text instead of the Schema.org enumeration; every photo shares one
alt text.

Google phased out the Vehicle Listing rich result (announced June 2025;
removed from Search Console reporting in the November 2025 update), so the
`Car`/`Offer` markup is kept for machine readability and accuracy, not for a
rich result.

## Fix plan

Implemented in this branch, in order: specification normalization with
multi-source corroboration (Phase 3), description provenance + deterministic
generation + backfill (Phase 2), mobile-first layout and lead actions
(Phases 4–5), SEO accuracy (Phase 6), tests (Phase 7). See
`docs/inventory/vehicle-descriptions.md` for the description system.
