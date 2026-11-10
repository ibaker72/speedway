import type { PGlite } from "@electric-sql/pglite";
import { SUPABASE_URL } from "./supabase-pglite";

/**
 * A small PostgREST emulator over PGlite, covering exactly what the inventory
 * sync and backfill send: GET with select (incl. `alias:col->>key`), eq/gt/
 * is/in/not.in filters, order and limit; POST upserts with on_conflict +
 * merge-duplicates; PATCH with filters. Values are coerced by Postgres via
 * jsonb_populate_record(set), as PostgREST does. Unknown columns produce a
 * 400, like the real service, so schema-fallback paths can be tested.
 */

export interface RequestLog {
  method: string;
  path: string;
  rows: number;
}

const IDENT = /^[a-z_][a-z0-9_]*$/;

function ident(name: string): string {
  if (!IDENT.test(name)) throw new Error(`bad identifier ${name}`);
  return `"${name}"`;
}

function parseList(raw: string): string[] {
  const inner = raw.replace(/^\(/, "").replace(/\)$/, "");
  const out: string[] = [];
  let current = "";
  let quoted = false;
  for (const ch of inner) {
    if (ch === '"') quoted = !quoted;
    else if (ch === "," && !quoted) {
      out.push(current);
      current = "";
    } else current += ch;
  }
  if (current || inner.length) out.push(current);
  return out;
}

const RESERVED = new Set(["select", "order", "limit", "offset", "on_conflict", "columns"]);

function whereClause(params: URLSearchParams, values: unknown[]): string {
  const clauses: string[] = [];
  for (const [key, raw] of params.entries()) {
    if (RESERVED.has(key)) continue;
    const col = ident(key);
    let match: RegExpMatchArray | null;
    if ((match = raw.match(/^not\.in\.(.*)$/))) {
      const list = parseList(match[1]);
      values.push(list);
      clauses.push(`NOT (${col}::text = ANY($${values.length}::text[]))`);
    } else if ((match = raw.match(/^in\.(.*)$/))) {
      const list = parseList(match[1]);
      values.push(list);
      clauses.push(`${col}::text = ANY($${values.length}::text[])`);
    } else if ((match = raw.match(/^is\.(null|true|false)$/))) {
      clauses.push(`${col} IS ${match[1].toUpperCase()}`);
    } else if ((match = raw.match(/^(eq|neq|gt|gte|lt|lte)\.(.*)$/))) {
      const op = { eq: "=", neq: "<>", gt: ">", gte: ">=", lt: "<", lte: "<=" }[match[1] as "eq"];
      values.push(match[2]);
      clauses.push(`${col}::text ${op} $${values.length}::text`);
    } else {
      throw new Error(`unsupported filter ${key}=${raw}`);
    }
  }
  return clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
}

function selectList(select: string | null): string {
  if (!select || select === "*") return "*";
  return select
    .split(",")
    .map((item) => {
      const [alias, expr] = item.includes(":") ? item.split(":") : [null, item];
      const json = expr.match(/^([a-z_]+)->>([a-z_A-Z]+)$/);
      const sql = json ? `(${ident(json[1])}->>'${json[2]}')` : ident(expr);
      return `${sql} AS ${ident(alias ?? (json ? json[2] : expr))}`;
    })
    .join(", ");
}

export function inventoryPostgrest(db: PGlite, log: RequestLog[] = []): typeof fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
    const method = (init?.method ?? "GET").toUpperCase();
    const match = url.pathname.match(/^\/rest\/v1\/([a-z_]+)$/);
    if (!url.href.startsWith(SUPABASE_URL) || !match) {
      return new Response(JSON.stringify({ message: `unexpected ${method} ${url.href}` }), { status: 500 });
    }
    const table = `public.${ident(match[1])}`;
    const params = url.searchParams;
    const prefer = new Headers(init?.headers).get("prefer") ?? "";
    const wantRows = prefer.includes("return=representation");
    const values: unknown[] = [];

    try {
      await db.exec("SET ROLE service_role");
      if (method === "GET") {
        const where = whereClause(params, values);
        const order = params.get("order");
        const orderSql = order
          ? `ORDER BY ${order
              .split(",")
              .map((part) => {
                const [col, dir] = part.split(".");
                return `${ident(col)} ${dir === "desc" ? "DESC" : "ASC"}`;
              })
              .join(", ")}`
          : "";
        const limit = params.get("limit") ? `LIMIT ${Number(params.get("limit"))}` : "";
        const offset = params.get("offset") ? `OFFSET ${Number(params.get("offset"))}` : "";
        const result = await db.query(
          `SELECT ${selectList(params.get("select"))} FROM ${table} ${where} ${orderSql} ${limit} ${offset}`,
          values
        );
        log.push({ method, path: url.pathname, rows: result.rows.length });
        return Response.json(result.rows);
      }

      const body = JSON.parse(String(init?.body ?? "null"));
      if (method === "POST") {
        const rows: Record<string, unknown>[] = Array.isArray(body) ? body : [body];
        if (rows.length === 0) return new Response(null, { status: 201 });
        const cols = Object.keys(rows[0]);
        for (const row of rows) {
          if (Object.keys(row).join(",") !== cols.join(",")) {
            return Response.json({ message: "All object keys must match" }, { status: 400 });
          }
        }
        const colSql = cols.map(ident).join(", ");
        const conflict = params.get("on_conflict");
        const upsert =
          conflict && prefer.includes("resolution=merge-duplicates")
            ? `ON CONFLICT (${ident(conflict)}) DO UPDATE SET ${cols.map((c) => `${ident(c)} = EXCLUDED.${ident(c)}`).join(", ")}`
            : "";
        const result = await db.query(
          `INSERT INTO ${table} (${colSql}) SELECT ${colSql} FROM jsonb_populate_recordset(NULL::${table}, $1::jsonb) ${upsert} RETURNING *`,
          [JSON.stringify(rows)]
        );
        log.push({ method, path: url.pathname, rows: result.rows.length });
        return wantRows ? Response.json(result.rows, { status: 201 }) : new Response(null, { status: 201 });
      }

      if (method === "PATCH") {
        const patch = body as Record<string, unknown>;
        const cols = Object.keys(patch);
        values.push(JSON.stringify(patch));
        const set = cols.map((c) => `${ident(c)} = (jsonb_populate_record(NULL::${table}, $1::jsonb)).${ident(c)}`).join(", ");
        const where = whereClause(params, values);
        const result = await db.query(`UPDATE ${table} SET ${set} ${where} RETURNING *`, values);
        log.push({ method, path: url.pathname, rows: result.rows.length });
        return wantRows ? Response.json(result.rows) : new Response(null, { status: 204 });
      }

      return Response.json({ message: `unsupported method ${method}` }, { status: 405 });
    } catch (err) {
      const message = (err as Error).message.split("\n")[0];
      return Response.json({ message }, { status: 400 });
    } finally {
      await db.exec("RESET ROLE");
    }
  }) as typeof fetch;
}

/** Applies the inventory migrations in order (optionally stopping before the newest). */
export const INVENTORY_MIGRATIONS = [
  "20260404_inventory.sql",
  "20260530_inventory_autofunds_columns.sql",
  "20260602_inventory_align_with_importer.sql",
  "20261109_inventory_descriptions_and_specs.sql",
];
