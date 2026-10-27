import { readFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";

/**
 * Test helpers that stand in for the production Supabase database: an
 * embedded Postgres with Supabase's API roles and the default privileges
 * observed on the live project's `public` schema (pg_default_acl grants
 * anon/authenticated/service_role every table privilege), plus a minimal
 * PostgREST-style fetch shim so the app's real insert code can run against it.
 */

const ROOT = path.resolve(__dirname, "../..");

export const SUPABASE_URL = "https://test-project.supabase.co";

export function readMigration(file: string): string {
  return readFileSync(path.join(ROOT, "db/migrations", file), "utf8");
}

export async function createSupabaseLikeDb(): Promise<PGlite> {
  const db = new PGlite();
  await db.exec(`
    CREATE ROLE anon NOLOGIN NOINHERIT;
    CREATE ROLE authenticated NOLOGIN NOINHERIT;
    CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
    GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
  `);
  return db;
}

/** Runs SQL as a Supabase API role and reports whether it was allowed. */
export async function runAs(db: PGlite, role: string, query: string): Promise<{ ok: true; rows: number } | { ok: false; error: string }> {
  try {
    await db.exec(`SET ROLE ${role}`);
    const result = await db.query(query);
    return { ok: true, rows: result.rows.length };
  } catch (err) {
    return { ok: false, error: (err as Error).message.split("\n")[0] };
  } finally {
    await db.exec("RESET ROLE");
  }
}

/**
 * Emulates `POST {SUPABASE_URL}/rest/v1/<table>` the way PostgREST handles it
 * for the service-role key: only the columns present in the JSON body are
 * inserted (others take their defaults), values are coerced by Postgres from
 * JSON, and `Prefer: return=representation` returns the inserted rows.
 */
export function postgrestFetch(db: PGlite): typeof fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
    const match = url.pathname.match(/^\/rest\/v1\/([a-z_]+)$/);
    if (!url.href.startsWith(SUPABASE_URL) || !match || (init?.method ?? "GET") !== "POST") {
      return new Response(JSON.stringify({ message: `unexpected request ${init?.method ?? "GET"} ${url.href}` }), { status: 500 });
    }
    const table = match[1];
    const body = JSON.parse(String(init?.body ?? "null"));
    const rows: Record<string, unknown>[] = Array.isArray(body) ? body : [body];
    try {
      await db.exec("SET ROLE service_role");
      const inserted: unknown[] = [];
      for (const row of rows) {
        const cols = Object.keys(row).map((c) => `"${c.replace(/"/g, "")}"`).join(", ");
        const result = await db.query(
          `INSERT INTO public.${table} (${cols}) SELECT ${cols} FROM jsonb_populate_record(NULL::public.${table}, $1::jsonb) RETURNING *`,
          [JSON.stringify(row)]
        );
        inserted.push(...result.rows);
      }
      return new Response(JSON.stringify(inserted), { status: 201, headers: { "content-type": "application/json" } });
    } catch (err) {
      return new Response(JSON.stringify({ message: (err as Error).message.split("\n")[0] }), { status: 400 });
    } finally {
      await db.exec("RESET ROLE");
    }
  }) as typeof fetch;
}
