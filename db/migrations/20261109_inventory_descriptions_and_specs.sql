-- Vehicle description provenance + normalized specifications
--
-- Context (see docs/inventory/2026-11-vehicle-detail-audit.md):
--   * 48 of 84 active vehicles have no description because the Autofunds feed
--     sends none; the site now generates one from verified data, and needs to
--     record where each description came from so manual edits are never
--     overwritten and regeneration only happens when the data changes.
--   * Spec columns had invented defaults ('FWD', 'Automatic', 'Gasoline'),
--     which is how a 4WD Jeep Wrangler was published as FWD. Unknown specs
--     must be storable as NULL.
--
-- Safe to run more than once. Only adds nullable columns and a CHECK
-- constraint, and drops NOT NULL / DEFAULT on spec columns. No data is
-- changed or deleted. Works on the repo schema (20260404_inventory.sql) and
-- on the live table, which drifted from it (columns already nullable there).
--
-- Rollback (if ever needed): the new columns can be dropped; nothing else
-- depends on them except the application code that ships with this file.

BEGIN;

ALTER TABLE public.inventory
  ADD COLUMN IF NOT EXISTS specs                    jsonb,
  ADD COLUMN IF NOT EXISTS feed_description         text,
  ADD COLUMN IF NOT EXISTS generated_description    text,
  ADD COLUMN IF NOT EXISTS description_source       text,
  ADD COLUMN IF NOT EXISTS description_generator    text,
  ADD COLUMN IF NOT EXISTS description_input_hash   text,
  ADD COLUMN IF NOT EXISTS description_hash         text,
  ADD COLUMN IF NOT EXISTS description_generated_at timestamptz,
  ADD COLUMN IF NOT EXISTS sync_hash                text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conrelid = 'public.inventory'::regclass
       AND conname = 'inventory_description_source_check'
  ) THEN
    ALTER TABLE public.inventory
      ADD CONSTRAINT inventory_description_source_check
      CHECK (description_source IS NULL OR description_source IN ('manual', 'feed', 'generated'));
  END IF;
END $$;

-- Unknown specs are NULL, never a guessed default. Each statement is a no-op
-- when the column is already nullable / has no default, and is skipped when
-- the column doesn't exist.
DO $$
DECLARE
  col text;
BEGIN
  FOREACH col IN ARRAY ARRAY['drivetrain', 'transmission', 'fuel_type', 'body_type', 'engine', 'exterior_color', 'interior_color']
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'inventory' AND column_name = col
    ) THEN
      EXECUTE format('ALTER TABLE public.inventory ALTER COLUMN %I DROP DEFAULT', col);
      EXECUTE format('ALTER TABLE public.inventory ALTER COLUMN %I DROP NOT NULL', col);
    END IF;
  END LOOP;
END $$;

COMMENT ON COLUMN public.inventory.description IS
  'Published vehicle description. Chosen by the sync/backfill: manual edit > usable Autofunds comments > generated. Edits made here are detected (description_hash mismatch) and never overwritten.';
COMMENT ON COLUMN public.inventory.specs IS
  'Normalized specifications (lib/inventory/specs.ts): values corroborated across the feed cell, trim/model text and Options; contradictions are NULL and listed under "conflicts".';
COMMENT ON COLUMN public.inventory.feed_description IS 'Latest Autofunds "Comments" cell, verbatim.';
COMMENT ON COLUMN public.inventory.generated_description IS 'Description generated from verified data (cached; reused while description_input_hash is unchanged).';
COMMENT ON COLUMN public.inventory.description_source IS 'manual | feed | generated. Set to manual to lock the description against automatic changes.';
COMMENT ON COLUMN public.inventory.description_generator IS 'Generator that produced generated_description, e.g. template-v1 or ai:<model>:template-v1.';
COMMENT ON COLUMN public.inventory.description_input_hash IS 'Hash of the verified facts used to generate generated_description (the source-data version).';
COMMENT ON COLUMN public.inventory.description_hash IS 'Hash of the description text the system last published; a mismatch means a person edited it.';
COMMENT ON COLUMN public.inventory.description_generated_at IS 'When generated_description was last (re)generated.';
COMMENT ON COLUMN public.inventory.sync_hash IS 'Hash of the row content the sync last wrote; unchanged rows are skipped.';

COMMIT;

NOTIFY pgrst, 'reload schema';
