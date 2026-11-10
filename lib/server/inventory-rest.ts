/**
 * Minimal PostgREST helpers for server-side inventory jobs (daily sync,
 * backfill). Uses the service-role key; never import from client code.
 */

export interface RestConfig {
  url: string;
  key: string;
}

export function inventoryRestConfig(): RestConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase environment variables are not configured");
  return { url: url.replace(/\/+$/, ""), key };
}

export function restHeaders(config: RestConfig, prefer?: string): Record<string, string> {
  return {
    apikey: config.key,
    Authorization: `Bearer ${config.key}`,
    "Content-Type": "application/json",
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

export class RestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: string
  ) {
    super(message);
  }
}

/** Reads every row matching `query` in pages (keyset pagination on `id`). */
export async function fetchAllRows<T extends { id: string }>(
  config: RestConfig,
  table: string,
  query: URLSearchParams,
  pageSize = 500
): Promise<T[]> {
  const rows: T[] = [];
  let after: string | null = null;
  for (;;) {
    const params = new URLSearchParams(query);
    params.set("order", "id.asc");
    params.set("limit", String(pageSize));
    if (after) params.set("id", `gt.${after}`);
    const res = await fetch(`${config.url}/rest/v1/${table}?${params.toString()}`, { headers: restHeaders(config) });
    if (!res.ok) {
      const body = await res.text();
      throw new RestError(`GET ${table} failed: ${res.status}`, res.status, body);
    }
    const page = (await res.json()) as T[];
    rows.push(...page);
    if (page.length < pageSize) return rows;
    after = page[page.length - 1].id;
  }
}

/** PostgREST `in.(...)` list with each value double-quoted. */
export function inList(values: string[]): string {
  return `(${values.map((v) => `"${v.replace(/["\\]/g, "")}"`).join(",")})`;
}

export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
