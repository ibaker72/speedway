// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { SUPABASE_URL, createSupabaseLikeDb, postgrestFetch, readMigration, runAs } from "./helpers/supabase-pglite";

vi.mock("@/lib/leads/notify", () => ({ notifyLead: vi.fn().mockResolvedValue(true) }));

const MIGRATION = readMigration("20261026_leads_table_rls.sql");
const ORIGINAL = readMigration("20260404_leads.sql");

async function shape(db: PGlite) {
  const columns = await db.query<{ column_name: string; type: string; not_null: boolean }>(`
    SELECT a.attname AS column_name, format_type(a.atttypid, a.atttypmod) AS type, a.attnotnull AS not_null
      FROM pg_attribute a WHERE a.attrelid = 'public.leads'::regclass AND a.attnum > 0 AND NOT a.attisdropped ORDER BY a.attnum`);
  const meta = await db.query<{ rls: boolean; policies: number; indexes: string[]; anon_privs: number; service_privs: number }>(`
    SELECT c.relrowsecurity AS rls,
           (SELECT count(*)::int FROM pg_policies WHERE tablename = 'leads') AS policies,
           ARRAY(SELECT indexname::text FROM pg_indexes WHERE tablename = 'leads' ORDER BY 1) AS indexes,
           (SELECT count(*)::int FROM information_schema.role_table_grants WHERE table_name = 'leads' AND grantee IN ('anon', 'authenticated', 'PUBLIC')) AS anon_privs,
           (SELECT count(*)::int FROM information_schema.role_table_grants WHERE table_name = 'leads' AND grantee = 'service_role') AS service_privs
      FROM pg_class c WHERE c.oid = 'public.leads'::regclass`);
  return { columns: columns.rows, ...meta.rows[0] };
}

async function applyExpectingFailure(db: PGlite, sql: string): Promise<string> {
  try {
    await db.exec(sql);
  } catch (err) {
    await db.exec("ROLLBACK").catch(() => {});
    return (err as Error).message;
  }
  throw new Error("migration unexpectedly succeeded");
}

describe("leads migration: fresh apply", () => {
  it("creates the expected table, indexes, RLS, and grants, and is idempotent", async () => {
    const db = await createSupabaseLikeDb();
    await db.exec(MIGRATION);
    const first = await shape(db);
    await db.exec(MIGRATION);
    expect(await shape(db)).toEqual(first);

    expect(first.columns).toEqual([
      { column_name: "id", type: "uuid", not_null: true },
      { column_name: "source", type: "text", not_null: true },
      { column_name: "name", type: "text", not_null: false },
      { column_name: "email", type: "text", not_null: false },
      { column_name: "phone", type: "text", not_null: false },
      { column_name: "payload", type: "jsonb", not_null: true },
      { column_name: "status", type: "text", not_null: true },
      { column_name: "created_at", type: "timestamp with time zone", not_null: true },
      { column_name: "notified_at", type: "timestamp with time zone", not_null: false },
    ]);
    expect(first.rls).toBe(true);
    expect(first.policies).toBe(0);
    expect(first.indexes).toEqual(["idx_leads_created_at", "idx_leads_email", "idx_leads_source", "idx_leads_status", "leads_pkey"]);
    expect(first.anon_privs).toBe(0);
    expect(first.service_privs).toBeGreaterThanOrEqual(4);
  });

  it("applies cleanly on top of the original 20260404 leads migration", async () => {
    const db = await createSupabaseLikeDb();
    await db.exec(ORIGINAL);
    await db.exec(MIGRATION);
    const result = await shape(db);
    expect(result.rls).toBe(true);
    expect(result.anon_privs).toBe(0);
  });

  it("does not change privileges on existing tables", async () => {
    const db = await createSupabaseLikeDb();
    await db.exec("CREATE TABLE public.deal_desk_leads (id uuid PRIMARY KEY)");
    const before = await db.query(`SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE table_name = 'deal_desk_leads' ORDER BY 1, 2`);
    await db.exec(MIGRATION);
    const after = await db.query(`SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE table_name = 'deal_desk_leads' ORDER BY 1, 2`);
    expect(after.rows).toEqual(before.rows);
  });

  it("denies anon and authenticated every operation while service_role keeps full access", async () => {
    const db = await createSupabaseLikeDb();
    await db.exec(MIGRATION);
    const insert = `INSERT INTO public.leads (source, name, payload, created_at) VALUES ('contact', 'A', '{}', now())`;
    for (const role of ["anon", "authenticated"]) {
      for (const query of [
        "SELECT * FROM public.leads",
        insert,
        "UPDATE public.leads SET status = 'x'",
        "DELETE FROM public.leads",
        "TRUNCATE public.leads",
      ]) {
        const result = await runAs(db, role, query);
        expect(result, `${role}: ${query}`).toEqual({ ok: false, error: "permission denied for table leads" });
      }
    }
    expect((await runAs(db, "service_role", insert)).ok).toBe(true);
    expect(await runAs(db, "service_role", "SELECT * FROM public.leads")).toEqual({ ok: true, rows: 1 });
    expect((await runAs(db, "service_role", "UPDATE public.leads SET notified_at = now()")).ok).toBe(true);
    expect((await runAs(db, "service_role", "DELETE FROM public.leads")).ok).toBe(true);
  });

  it("rolls back fully with the documented DROP statement", async () => {
    const db = await createSupabaseLikeDb();
    await db.exec(MIGRATION);
    await db.exec("DROP TABLE IF EXISTS public.leads;");
    expect((await db.query<{ reg: string | null }>("SELECT to_regclass('public.leads')::text AS reg")).rows[0].reg).toBeNull();
  });
});

describe("leads migration: compatibility guard", () => {
  const BASE = `
    CREATE TABLE public.leads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      source TEXT NOT NULL, name TEXT, email TEXT, phone TEXT,
      payload JSONB NOT NULL DEFAULT '{}'::jsonb, status TEXT NOT NULL DEFAULT 'new',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(), notified_at TIMESTAMPTZ
    );`;

  const drift: { name: string; setup: string; expected: string }[] = [
    { name: "a column is missing", setup: BASE + "ALTER TABLE public.leads DROP COLUMN notified_at;", expected: "missing column notified_at" },
    { name: "created_at has no time zone", setup: BASE + "ALTER TABLE public.leads ALTER COLUMN created_at TYPE timestamp;", expected: "column created_at is timestamp without time zone, expected timestamp with time zone" },
    { name: "payload is json instead of jsonb", setup: BASE + "ALTER TABLE public.leads ALTER COLUMN payload DROP DEFAULT; ALTER TABLE public.leads ALTER COLUMN payload TYPE json USING payload::json;", expected: "column payload is json, expected jsonb" },
    { name: "id is not a uuid", setup: "CREATE TABLE public.leads (id bigserial PRIMARY KEY, source TEXT NOT NULL, name TEXT, email TEXT, phone TEXT, payload JSONB NOT NULL, status TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL, notified_at TIMESTAMPTZ);", expected: "column id is bigint, expected uuid" },
    { name: "name is NOT NULL (app sends null)", setup: BASE + "ALTER TABLE public.leads ALTER COLUMN name SET NOT NULL;", expected: "column name is NOT NULL, expected nullable" },
    { name: "source is nullable", setup: BASE + "ALTER TABLE public.leads ALTER COLUMN source DROP NOT NULL;", expected: "column source is nullable, expected NOT NULL" },
    { name: "id has no generated default", setup: BASE + "ALTER TABLE public.leads ALTER COLUMN id DROP DEFAULT;", expected: "column id must default to gen_random_uuid() (found no default)" },
    { name: "the primary key is missing", setup: BASE + "ALTER TABLE public.leads DROP CONSTRAINT leads_pkey;", expected: "primary key is not exactly (id)" },
    { name: "an extra required column has no default", setup: BASE + "ALTER TABLE public.leads ADD COLUMN dealer_id int NOT NULL;", expected: "extra column dealer_id is NOT NULL without a default" },
    { name: "email is unique", setup: BASE + "ALTER TABLE public.leads ADD CONSTRAINT leads_email_key UNIQUE (email);", expected: "unexpected constraint leads_email_key: UNIQUE (email)" },
    { name: "status has a check constraint", setup: BASE + "ALTER TABLE public.leads ADD CONSTRAINT leads_status_check CHECK (status IN ('open'));", expected: "unexpected constraint leads_status_check" },
    { name: "a foreign key exists", setup: "CREATE TABLE public.dealers (id int PRIMARY KEY);" + BASE + "ALTER TABLE public.leads ADD COLUMN dealer_id int REFERENCES public.dealers(id);", expected: "unexpected constraint leads_dealer_id_fkey" },
    { name: "a trigger exists", setup: BASE + "CREATE FUNCTION public.noop() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RETURN NEW; END $$; CREATE TRIGGER leads_noop BEFORE INSERT ON public.leads FOR EACH ROW EXECUTE FUNCTION public.noop();", expected: "unexpected trigger leads_noop" },
    { name: "a rule exists", setup: BASE + "CREATE RULE leads_redirect AS ON INSERT TO public.leads DO INSTEAD NOTHING;", expected: "unexpected rule leads_redirect" },
    { name: "an RLS policy already exists", setup: BASE + "CREATE POLICY anyone_reads ON public.leads FOR SELECT USING (true);", expected: "unexpected RLS policy anyone_reads" },
  ];

  for (const { name, setup, expected } of drift) {
    it(`aborts with no changes when ${name}`, async () => {
      const db = await createSupabaseLikeDb();
      await db.exec(setup);
      const message = await applyExpectingFailure(db, MIGRATION);
      expect(message).toContain("public.leads is not compatible with the app");
      expect(message).toContain(expected);

      // Nothing from the migration was applied.
      const state = await db.query<{ rls: boolean; idx: number; anon_privs: number; comment: string | null }>(`
        SELECT c.relrowsecurity AS rls,
               (SELECT count(*)::int FROM pg_indexes WHERE tablename = 'leads' AND indexname LIKE 'idx_leads_%') AS idx,
               (SELECT count(*)::int FROM information_schema.role_table_grants WHERE table_name = 'leads' AND grantee = 'anon') AS anon_privs,
               obj_description(c.oid, 'pg_class') AS comment
          FROM pg_class c WHERE c.oid = 'public.leads'::regclass`);
      expect(state.rows[0]).toEqual({ rls: false, idx: 0, anon_privs: 7, comment: null });
    });
  }

  it("refuses to treat a view named leads as the table", async () => {
    const db = await createSupabaseLikeDb();
    await db.exec("CREATE VIEW public.leads AS SELECT 1 AS id;");
    expect(await applyExpectingFailure(db, MIGRATION)).toContain("public.leads is not an ordinary table (relkind v)");
  });

  it("reports every problem at once", async () => {
    const db = await createSupabaseLikeDb();
    await db.exec(BASE + "ALTER TABLE public.leads ALTER COLUMN name SET NOT NULL; ALTER TABLE public.leads ALTER COLUMN created_at TYPE timestamp;");
    const message = await applyExpectingFailure(db, MIGRATION);
    expect(message).toContain("column name is NOT NULL, expected nullable");
    expect(message).toContain("column created_at is timestamp without time zone");
  });

  it("accepts an existing compatible table with an extra optional column", async () => {
    const db = await createSupabaseLikeDb();
    await db.exec(BASE + "ALTER TABLE public.leads ADD COLUMN assigned_rep text;");
    await db.exec(MIGRATION);
    expect((await shape(db)).rls).toBe(true);
  });
});

describe("leads migration: the app's real write paths", () => {
  let db: PGlite;
  const env = { ...process.env };
  let ip = 0;
  const post = (body: unknown) =>
    new Request("http://localhost/api", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": `198.51.100.${++ip}` },
      body: JSON.stringify(body),
    });

  beforeEach(async () => {
    db = await createSupabaseLikeDb();
    await db.exec(MIGRATION);
    process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
    vi.stubGlobal("fetch", postgrestFetch(db));
  });
  afterEach(() => {
    process.env = { ...env };
    vi.unstubAllGlobals();
  });

  it("stores leads from every lead form with the expected column types", async () => {
    const routes = await Promise.all([
      import("@/app/api/contact/route"),
      import("@/app/api/finance/route"),
      import("@/app/api/test-drive/route"),
      import("@/app/api/trade-in/route"),
      import("@/app/api/sell-car/route"),
      import("@/app/api/inventory-alerts/route"),
      import("@/app/api/shipping-inquiry/route"),
    ]);
    const bodies = [
      { name: "Contact Person", email: "c@example.com", subject: "general", message: "Hello" },
      { firstName: "Fin", lastName: "Ance", email: "f@example.com", phone: "8625550100", monthlyIncome: "5200" },
      { name: "Test Driver", email: "t@example.com", phone: "8625550101", vehicleId: "v1", vehicleTitle: "2022 Toyota Camry" },
      { name: "Trade In", email: "ti@example.com", phone: "8625550102", year: 2018, make: "Honda", model: "Civic", mileage: 60000 },
      { name: "Sell Car", email: "s@example.com", phone: "8625550103", year: 2017, make: "Ford", model: "Escape" },
      { email: "alerts@example.com", source: "price-drop", vehicleSlug: "2022-toyota-camry-se", currentPrice: 24995 },
      {
        name: "Ship Buyer", email: "ship@example.com", phone: "(555) 123-4567", vehicleOfInterest: "2022 Toyota Camry SE",
        vehicleSlug: "2022-toyota-camry-se", deliveryZip: "30301", deliveryState: "GA", consent: true,
      },
    ];
    for (let i = 0; i < routes.length; i++) {
      const res = await routes[i].POST(post(bodies[i]));
      expect(res.status, `route ${i}`).toBe(200);
      expect((await res.json()).leadId).toMatch(/^[0-9a-f-]{36}$/);
    }

    const rows = await db.query<{ source: string; status: string; created_at: Date; payload_type: string; notified_at: Date | null }>(`
      SELECT source, status, created_at, jsonb_typeof(payload) AS payload_type, notified_at FROM public.leads ORDER BY created_at, source`);
    expect(rows.rows.map((r) => r.source).sort()).toEqual(
      ["contact", "finance", "price-drop", "sell-car", "shipping", "test-drive", "trade-in"].sort()
    );
    for (const row of rows.rows) {
      expect(row.status).toBe("new");
      expect(row.created_at).toBeInstanceOf(Date);
      expect(row.payload_type).toBe("object");
    }

    const shipping = await db.query<{ vehicle_title: string; zip: string }>(
      `SELECT payload->'vehicle'->>'title' AS vehicle_title, payload->>'deliveryZip' AS zip FROM public.leads WHERE source = 'shipping'`
    );
    expect(shipping.rows[0]).toEqual({ vehicle_title: "2022 Toyota Camry SE", zip: "30301" });
  });
});
