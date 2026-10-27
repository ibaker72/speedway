-- Create the `leads` table in production and lock it down.
--
-- Context: 20260404_leads.sql was never applied to the production project
-- (verified 2026-10-27: no `leads` relation in any schema), so every insert
-- from /api/contact, /api/finance, /api/test-drive, /api/trade-in,
-- /api/sell-car, /api/inventory-alerts and /api/shipping-inquiry fails.
--
-- Safe to run more than once, and safe whether or not 20260404_leads.sql was
-- applied: the table definition and index names are identical to that file.
-- It only adds objects; nothing existing is altered, locked, or dropped.
--
-- Access model: the website writes with the service-role key from server
-- routes only (service_role has BYPASSRLS). Supabase's default privileges
-- would otherwise grant anon/authenticated every privilege on a new public
-- table — including TRUNCATE, which RLS does not cover — so those grants are
-- revoked explicitly and RLS is enabled with no policies (deny by default).

BEGIN;

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notified_at TIMESTAMPTZ
);

-- If a `leads` table already existed, CREATE TABLE IF NOT EXISTS skipped it.
-- Abort (and roll back everything) unless it has the columns the app writes.
DO $$
DECLARE
  missing TEXT;
BEGIN
  SELECT string_agg(required.col, ', ')
    INTO missing
    FROM (VALUES ('id'), ('source'), ('name'), ('email'), ('phone'),
                 ('payload'), ('status'), ('created_at'), ('notified_at')) AS required(col)
   WHERE NOT EXISTS (
     SELECT 1 FROM information_schema.columns c
      WHERE c.table_schema = 'public' AND c.table_name = 'leads' AND c.column_name = required.col
   );
  IF missing IS NOT NULL THEN
    RAISE EXCEPTION 'public.leads exists but is missing columns: %', missing;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads (source);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads (email);

-- Deny by default: no policies are created, so anon/authenticated requests
-- through the Data API (REST/GraphQL) can neither read nor write rows.
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Defense in depth on top of RLS: remove the privileges Supabase grants to
-- every new public table, and keep exactly what the server-side code needs.
REVOKE ALL ON TABLE public.leads FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.leads TO service_role;

COMMENT ON TABLE public.leads IS
  'Website lead submissions (contact, finance, test drive, trade-in, sell car, inventory alerts, shipping). Contains customer PII. Server-side writes via service_role only; RLS on with no policies.';

COMMIT;

-- Ask PostgREST to reload its schema cache so the new table is reachable
-- immediately (the pgrst_ddl_watch event trigger normally does this too).
NOTIFY pgrst, 'reload schema';
