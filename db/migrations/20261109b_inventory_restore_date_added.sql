-- OPTIONAL data repair — review before applying.
--
-- Until this release, every daily Autofunds sync re-sent `date_added = now()`,
-- so on 2026-11-09 all 84 active vehicles had the same date_added (that
-- morning's sync) even though created_at spans 44 different days. The fixed
-- importer no longer touches date_added on existing rows; this restores the
-- original value from created_at.
--
-- What it changes: date_added on rows where it is later than created_at.
-- What it does not change: anything else. Rows without created_at are skipped.
-- Idempotent: a second run updates 0 rows.
--
-- Preview first:
--   SELECT count(*) FROM public.inventory
--    WHERE created_at IS NOT NULL AND date_added > created_at;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'inventory' AND column_name = 'created_at'
  ) THEN
    UPDATE public.inventory
       SET date_added = created_at
     WHERE created_at IS NOT NULL
       AND date_added > created_at;
  END IF;
END $$;
