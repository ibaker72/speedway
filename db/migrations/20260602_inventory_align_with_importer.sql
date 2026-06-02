-- Reconcile live public.inventory with the AutoFunds importer
--
-- The live inventory table was created out of band and drifted from
-- db/migrations/20260404_inventory.sql. The first real AutoFunds cron sync
-- failed with `Could not find the 'body_type' column of 'inventory' in the
-- schema cache` because the live column is body_style, and several other
-- fields written by lib/server/importVehicles.ts -> toRow() are missing.
--
-- This migration:
--   1. Renames body_style -> body_type so it matches the schema migration
--      and every write path (importVehicles, /api/inventory/ingest,
--      scripts/import-csv).
--   2. Adds the other columns the importer writes that don't exist yet.
--   3. Adds the indexes from the original migration.
--   4. Nudges PostgREST to reload its schema cache so the new columns
--      are visible immediately instead of after the ~10-minute auto-reload.
--
-- Safe to run: public.inventory has 0 rows at the time of writing.

BEGIN;

-- 1. body_style -> body_type (only if the live column hasn't been renamed yet).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'inventory'
      AND column_name  = 'body_style'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'inventory'
      AND column_name  = 'body_type'
  ) THEN
    ALTER TABLE public.inventory RENAME COLUMN body_style TO body_type;
  END IF;
END $$;

-- 2. Add every column importVehicles.toRow() writes that isn't on the table.
ALTER TABLE public.inventory
  ADD COLUMN IF NOT EXISTS body_type         text,
  ADD COLUMN IF NOT EXISTS slug              text,
  ADD COLUMN IF NOT EXISTS msrp              numeric,
  ADD COLUMN IF NOT EXISTS internet_price    numeric,
  ADD COLUMN IF NOT EXISTS thumbnail_url     text,
  ADD COLUMN IF NOT EXISTS features          text[]      NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS highlights        text[],
  ADD COLUMN IF NOT EXISTS is_commercial     boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_featured       boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_new_arrival    boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS date_added        timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS estimated_payment numeric;

-- 3. Indexes from db/migrations/20260404_inventory.sql that the live table is missing.
CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_slug         ON public.inventory (slug);
CREATE        INDEX IF NOT EXISTS idx_inventory_body_type    ON public.inventory (body_type);
CREATE        INDEX IF NOT EXISTS idx_inventory_is_sold      ON public.inventory (is_sold);
CREATE        INDEX IF NOT EXISTS idx_inventory_is_featured  ON public.inventory (is_featured);
CREATE        INDEX IF NOT EXISTS idx_inventory_date_added   ON public.inventory (date_added DESC);

COMMIT;

-- 4. Force PostgREST to drop its cached schema so the new columns are visible
--    on the next request. Run this outside the transaction.
NOTIFY pgrst, 'reload schema';
