import { resilientFetch } from "@/lib/server/resilient-fetch";

/** Parses a PostgREST body; `Prefer: return=minimal` and 204 responses have none. */
async function readRows<T>(res: Response): Promise<T[]> {
  const text = await res.text();
  return text ? (JSON.parse(text) as T[]) : [];
}

type SupabaseResponse<T = unknown> = {
  data: T | null;
  error: string | null;
  count?: number;
};

function getConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required"
    );
  }

  return { url, serviceKey };
}

function headers(key: string, extra?: Record<string, string>) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

export async function supabaseQuery<T = unknown>(
  table: string,
  params?: URLSearchParams,
  options?: { prefer?: string; revalidate?: number }
): Promise<SupabaseResponse<T[]>> {
  const { url, serviceKey } = getConfig();
  const qs = params ? `?${params.toString()}` : "";

  const hdrs = headers(serviceKey, options?.prefer ? { Prefer: options.prefer } : undefined);

  try {
    const res = await resilientFetch(
      `${url}/rest/v1/${table}${qs}`,
      { headers: hdrs, next: options?.revalidate !== undefined ? { revalidate: options.revalidate } : undefined },
      { label: `${table}.select` }
    );

    if (!res.ok) {
      const text = await res.text();
      return { data: null, error: `Supabase error ${res.status}: ${text}` };
    }

    const data = (await res.json()) as T[];
    const range = res.headers.get("content-range");
    const count = range?.split("/")[1] ? Number(range.split("/")[1]) : undefined;

    return { data, error: null, count };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown Supabase error" };
  }
}

export async function supabaseInsert<T = unknown>(
  table: string,
  rows: Record<string, unknown> | Record<string, unknown>[],
  options?: {
    onConflict?: string;
    prefer?: string;
    /**
     * Retry transient failures. Only safe when repeating the insert cannot
     * create a duplicate (a fixed primary key with `resolution=ignore-duplicates`
     * or `merge-duplicates`).
     */
    idempotent?: boolean;
  }
): Promise<SupabaseResponse<T[]>> {
  const { url, serviceKey } = getConfig();

  const prefer = options?.prefer || "return=representation";
  const hdrs = headers(serviceKey, { Prefer: prefer });

  let qs = "";
  if (options?.onConflict) {
    qs = `?on_conflict=${options.onConflict}`;
  }

  try {
    const res = await resilientFetch(
      `${url}/rest/v1/${table}${qs}`,
      { method: "POST", headers: hdrs, body: JSON.stringify(rows) },
      { label: `${table}.insert`, idempotent: options?.idempotent ?? false }
    );

    if (!res.ok) {
      const text = await res.text();
      return { data: null, error: `Supabase insert error ${res.status}: ${text}` };
    }

    const data = await readRows<T>(res);
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown Supabase error" };
  }
}

export async function supabaseUpsert<T = unknown>(
  table: string,
  rows: Record<string, unknown>[],
  onConflict: string
): Promise<SupabaseResponse<T[]>> {
  return supabaseInsert<T>(table, rows, {
    onConflict,
    prefer: "return=representation,resolution=merge-duplicates",
  });
}

export async function supabaseUpdate<T = unknown>(
  table: string,
  params: URLSearchParams,
  updates: Record<string, unknown>,
  /** `idempotent`: retry transient failures (only when applying the update twice is harmless). */
  options?: { idempotent?: boolean }
): Promise<SupabaseResponse<T[]>> {
  const { url, serviceKey } = getConfig();
  const hdrs = headers(serviceKey, { Prefer: "return=representation" });

  try {
    const res = await resilientFetch(
      `${url}/rest/v1/${table}?${params.toString()}`,
      { method: "PATCH", headers: hdrs, body: JSON.stringify(updates) },
      { label: `${table}.update`, idempotent: options?.idempotent ?? false }
    );

    if (!res.ok) {
      const text = await res.text();
      return { data: null, error: `Supabase update error ${res.status}: ${text}` };
    }

    const data = await readRows<T>(res);
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown Supabase error" };
  }
}

export async function supabaseRpc<T = unknown>(
  fnName: string,
  args?: Record<string, unknown>
): Promise<SupabaseResponse<T>> {
  const { url, serviceKey } = getConfig();
  const hdrs = headers(serviceKey);

  try {
    const res = await fetch(`${url}/rest/v1/rpc/${fnName}`, {
      method: "POST",
      headers: hdrs,
      body: JSON.stringify(args || {}),
    });

    if (!res.ok) {
      const text = await res.text();
      return { data: null, error: `Supabase RPC error ${res.status}: ${text}` };
    }

    const data = (await res.json()) as T;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown Supabase error" };
  }
}
