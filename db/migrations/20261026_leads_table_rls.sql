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

-- Compatibility guard. If a `leads` relation already existed, CREATE TABLE IF
-- NOT EXISTS skipped it, so verify it is exactly what the app expects. Any
-- mismatch raises an exception and the whole transaction rolls back with no
-- changes. On a fresh table every check passes.
DO $$
DECLARE
  rel        regclass := to_regclass('public.leads');
  rel_kind   "char";
  problems   TEXT[] := ARRAY[]::TEXT[];
  expected   RECORD;
  actual     RECORD;
  item       RECORD;
  id_attnum  SMALLINT;
BEGIN
  SELECT c.relkind INTO rel_kind FROM pg_class c WHERE c.oid = rel;
  IF rel IS NULL OR rel_kind IS DISTINCT FROM 'r' THEN
    RAISE EXCEPTION 'public.leads is not an ordinary table (relkind %); refusing to continue', coalesce(rel_kind::text, 'none');
  END IF;

  -- Columns the app writes or relies on: exact type, nullability, and whether
  -- a default is required (the app never sends `id`).
  FOR expected IN
    SELECT * FROM (VALUES
      ('id',          'uuid',                     true,  true),
      ('source',      'text',                     true,  false),
      ('name',        'text',                     false, false),
      ('email',       'text',                     false, false),
      ('phone',       'text',                     false, false),
      ('payload',     'jsonb',                    true,  false),
      ('status',      'text',                     true,  false),
      ('created_at',  'timestamp with time zone', true,  false),
      ('notified_at', 'timestamp with time zone', false, false)
    ) AS t(col, typ, not_null, needs_default)
  LOOP
    SELECT a.attnum,
           format_type(a.atttypid, a.atttypmod) AS typ,
           a.attnotnull AS not_null,
           pg_get_expr(ad.adbin, ad.adrelid) AS default_expr
      INTO actual
      FROM pg_attribute a
      LEFT JOIN pg_attrdef ad ON ad.adrelid = a.attrelid AND ad.adnum = a.attnum
     WHERE a.attrelid = rel AND a.attname = expected.col AND a.attnum > 0 AND NOT a.attisdropped;

    IF NOT FOUND THEN
      problems := problems || format('missing column %s', expected.col);
      CONTINUE;
    END IF;
    IF expected.col = 'id' THEN
      id_attnum := actual.attnum;
    END IF;
    IF actual.typ <> expected.typ THEN
      problems := problems || format('column %s is %s, expected %s', expected.col, actual.typ, expected.typ);
    END IF;
    IF actual.not_null <> expected.not_null THEN
      problems := problems || format('column %s is %s, expected %s', expected.col,
        CASE WHEN actual.not_null THEN 'NOT NULL' ELSE 'nullable' END,
        CASE WHEN expected.not_null THEN 'NOT NULL' ELSE 'nullable' END);
    END IF;
    IF expected.needs_default
       AND coalesce(actual.default_expr, '') !~ '(gen_random_uuid|uuid_generate_v4)\(\)' THEN
      problems := problems || format('column %s must default to gen_random_uuid() (found %s)', expected.col, coalesce(actual.default_expr, 'no default'));
    END IF;
  END LOOP;

  -- Extra columns are tolerated only if inserts can omit them.
  FOR item IN
    SELECT a.attname
      FROM pg_attribute a
      LEFT JOIN pg_attrdef ad ON ad.adrelid = a.attrelid AND ad.adnum = a.attnum
     WHERE a.attrelid = rel AND a.attnum > 0 AND NOT a.attisdropped
       AND a.attname NOT IN ('id', 'source', 'name', 'email', 'phone', 'payload', 'status', 'created_at', 'notified_at')
       AND a.attnotnull AND ad.adbin IS NULL AND a.attidentity = '' AND a.attgenerated = ''
  LOOP
    problems := problems || format('extra column %s is NOT NULL without a default (inserts would fail)', item.attname);
  END LOOP;

  -- Primary key must be exactly (id).
  IF id_attnum IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conrelid = rel AND contype = 'p' AND conkey = ARRAY[id_attnum]::SMALLINT[]
  ) THEN
    problems := problems || 'primary key is not exactly (id)'::TEXT;
  END IF;

  -- No other constraints that could reject app rows (unique, check, foreign
  -- key, exclusion, constraint triggers). NOT NULL is validated above.
  FOR item IN
    SELECT conname, contype, pg_get_constraintdef(oid) AS def
      FROM pg_constraint
     WHERE conrelid = rel AND contype NOT IN ('p', 'n')
  LOOP
    problems := problems || format('unexpected constraint %s: %s', item.conname, item.def);
  END LOOP;

  -- No triggers or rules that could rewrite, redirect, or reject inserts.
  FOR item IN SELECT tgname FROM pg_trigger WHERE tgrelid = rel AND NOT tgisinternal LOOP
    problems := problems || format('unexpected trigger %s', item.tgname);
  END LOOP;
  FOR item IN SELECT rulename FROM pg_rules WHERE schemaname = 'public' AND tablename = 'leads' LOOP
    problems := problems || format('unexpected rule %s', item.rulename);
  END LOOP;

  -- Pre-existing policies mean someone designed different access rules.
  FOR item IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'leads' LOOP
    problems := problems || format('unexpected RLS policy %s', item.policyname);
  END LOOP;

  IF array_length(problems, 1) > 0 THEN
    RAISE EXCEPTION 'public.leads is not compatible with the app: %', array_to_string(problems, '; ');
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
