# Vehicle descriptions and specifications

How every listing gets an accurate description and spec sheet, even when the
Autofunds feed is incomplete. Background: `2026-11-vehicle-detail-audit.md`.

## Which description is published

`inventory.description` holds the published text. The nightly sync
(`lib/server/importVehicles.ts`) and the backfill choose it with
`planDescription()` (`lib/descriptions/plan.ts`):

| Priority | Source (`description_source`) | When |
|---|---|---|
| 1 | `manual` | Staff wrote or edited the description in Supabase, or set `description_source = 'manual'`. **Never overwritten.** |
| 2 | `feed` | The Autofunds `Comments` cell reads as a real description: ≥ 20 words and ≥ 120 characters, not a placeholder, and it doesn't name another vehicle's VIN. |
| 3 | `generated` | Otherwise. Built from verified facts by the template (`template-v1`), optionally rewritten offline by AI. |

Short dealer comments that aren't a description (e.g. `CASH DEAL ONLY !.`)
are kept in `feed_description` and shown on the page as a dealer note.

### Editing a description by hand

Edit `description` in the Supabase table editor. The next sync notices that
the text no longer matches `description_hash` (the hash of what the system
last published) and locks the row to `manual`. To lock a row without editing
it, set `description_source` to `manual`. To return a row to automatic
descriptions, set `description_source` to `generated` **and** clear
`description_hash` and `description`.

## Provenance columns (migration `20261109_inventory_descriptions_and_specs.sql`)

| Column | Meaning |
|---|---|
| `description_source` | `manual` / `feed` / `generated` |
| `feed_description` | Latest Autofunds `Comments`, verbatim |
| `generated_description` | Cached generated text |
| `description_generator` | `template-v1`, or `ai:<model>:template-v1` |
| `description_input_hash` | Hash of the facts used (the source-data version) |
| `description_generated_at` | When the cached text was last generated |
| `description_hash` | Hash of the text the system last published |
| `specs` | Normalized specs + per-field source + conflicts |
| `sync_hash` | Hash of the row content the sync last wrote |

## When descriptions regenerate

Only when `description_input_hash` changes, i.e. when a fact used in the
text changes (year/make/model/trim, mileage, body, engine, transmission,
drivetrain, fuel, colors, seating, highlighted equipment), or when the
template version is bumped. **Price is not an input**: it changes often and is
shown beside the description. A nightly sync of an unchanged feed writes
nothing except one bulk `last_seen_at` update.

## What a generated description may say

`lib/descriptions/template.ts` only uses `DescriptionFacts`
(`lib/descriptions/facts.ts`): identity, mileage, verified specs, colors,
seating, and highlight equipment matched from the Options list
(`lib/inventory/features.ts`, unconditional entries only). Each sentence is
included only when its fact is present. Sentence variants are chosen from a
hash of the VIN, so text is stable night to night but differs across similar
vehicles.

It never mentions accident/title/service/ownership history, condition,
inspections, warranties, certification, financing approval, or price.
`validateGeneratedDescription()` enforces this, rejects numbers that aren't
in the facts, and limits make/model repetition. Tests run every local
inventory vehicle through it.

## Specifications

`normalizeVehicleSpecs()` (`lib/inventory/specs.ts`) reads each spec from up
to three sources: the feed cell, the trim/model text, and short unconditional
Options entries. The feed value wins when the others agree or are silent;
the others fill a blank cell; any disagreement makes the field unavailable
(omitted on the page and in structured data) and is recorded in
`specs.conflicts`. Nothing is ever defaulted.

Known feed quirks handled: blank `DriveTrain`; `Transmission` sent as
`Automatic` for every vehicle (manual cars are flagged via trim/Options);
hybrids previously stored as electric; interior colors truncated at 20
characters; unformatted engine text (`2 4 Cylinder Engine` → `2.0L
4-Cylinder`).

## Backfill

```bash
npx tsx scripts/backfill-vehicle-descriptions.ts             # dry run (default): report only
npx tsx scripts/backfill-vehicle-descriptions.ts --verbose   # list every change
npx tsx scripts/backfill-vehicle-descriptions.ts --apply     # write
npx tsx scripts/backfill-vehicle-descriptions.ts --apply --after <cursor>   # resume
```

Idempotent (a second run changes nothing), resumable (prints a cursor after
each page), active rows only unless `--include-sold`, and it never touches
price, status, sold flags, photos, or merchandising flags. Requires the
20261109 migration.

## Optional AI rewrite (off by default)

```bash
DESCRIPTION_AI_ENABLED=true ANTHROPIC_API_KEY=... \
  npx tsx scripts/backfill-vehicle-descriptions.ts --apply --ai
```

- Only the backfill script calls the API. Pages, API routes and the nightly
  sync never do (a test fails if any of them imports `lib/descriptions/ai`).
- Model: `DESCRIPTION_AI_MODEL` (default `claude-opus-5-5`), effort `low`,
  server-side refusal fallback (`fallbacks: "default"`) enabled.
- Cost control: at most `DESCRIPTION_AI_MAX_PER_RUN` requests per run
  (default 25); the run stops on rate-limit/auth errors; rewrites are cached
  by facts hash, so a vehicle is only rewritten again when its facts change.
- Every rewrite must pass the same validator as the template, or the
  template text is kept.
