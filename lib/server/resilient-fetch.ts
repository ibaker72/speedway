/**
 * fetch() with bounded retries for transient failures, used for Supabase
 * (PostgREST) requests from server code.
 *
 * Why: production logs show Supabase requests failing before any response is
 * read ("other side closed" with bytesRead 0, `write ETIMEDOUT`,
 * `ECONNRESET`/"terminated"), usually several at once in one render, while
 * Supabase itself served every request it received (no 5xx/429). That is the
 * signature of pooled keep-alive sockets that went stale while the serverless
 * instance was idle. A retry opens a fresh connection, so one or two quick
 * retries recover almost all of them.
 *
 * Rules:
 * - Only idempotent requests are retried (GET/HEAD by default; other methods
 *   only when the caller marks the request idempotent).
 * - Retried: connection-level errors, per-attempt timeouts, and HTTP 408, 429,
 *   500, 502, 503, 504 and Cloudflare 52x. Never retried: other 4xx (bad
 *   query, invalid credentials, permission denied) — retrying cannot help.
 * - Full-jitter exponential backoff; `Retry-After` is honoured when it fits
 *   the budget, otherwise the response is returned as-is.
 * - The response body is read inside the retry loop, because a connection
 *   reset can also surface while reading the body ("TypeError: terminated").
 * - A per-instance circuit breaker stops retrying after repeated exhausted
 *   failures, so an outage does not multiply traffic (retry storm).
 * - Logs carry the label, attempt and error code only — no URLs, keys or
 *   request bodies.
 */

export interface ResilientFetchOptions {
  /** Short name for logs, e.g. "inventory.list". */
  label: string;
  /** Extra attempts after the first (default 2, so at most 3 requests). */
  retries?: number;
  /** Per-attempt timeout in ms (default 8000). */
  timeoutMs?: number;
  /** Backoff base in ms (default 150) and cap (default 1500). */
  baseDelayMs?: number;
  maxDelayMs?: number;
  /** Allow retrying a non-GET request (only when repeating it is harmless). */
  idempotent?: boolean;
  /** Test hooks. */
  sleep?: (ms: number) => Promise<void>;
  random?: () => number;
}

const TRANSIENT_ERROR_CODES = new Set([
  "UND_ERR_SOCKET",
  "UND_ERR_CLOSED",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_BODY_TIMEOUT",
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "EPIPE",
  "EAI_AGAIN",
  "ENETUNREACH",
  "EHOSTUNREACH",
]);

const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504, 520, 521, 522, 523, 524]);

/** Error code when `err` is a transient network failure worth retrying, else null. */
export function transientErrorCode(err: unknown): string | null {
  if (!(err instanceof Error)) return null;
  if (err.name === "TimeoutError") return "TIMEOUT";
  if (err.name === "AbortError") return null; // aborted by the caller, not by us
  const cause = (err as { cause?: unknown }).cause as { code?: unknown; message?: unknown } | undefined;
  const ownCode = (err as unknown as { code?: unknown }).code;
  const code = typeof cause?.code === "string" ? cause.code : typeof ownCode === "string" ? ownCode : null;
  if (code) return TRANSIENT_ERROR_CODES.has(code) ? code : null;
  if (err.message === "terminated") return "TERMINATED";
  if (err instanceof TypeError && err.message === "fetch failed") return "FETCH_FAILED";
  return null;
}

export function isRetryableStatus(status: number): boolean {
  return RETRYABLE_STATUS.has(status);
}

/** Thrown when every attempt failed at the network level. */
export class TransientFetchError extends Error {
  readonly code: string;
  readonly attempts: number;
  constructor(label: string, code: string, attempts: number, cause: unknown) {
    super(`${label}: request failed after ${attempts} attempt${attempts === 1 ? "" : "s"} (${code})`, { cause });
    this.name = "TransientFetchError";
    this.code = code;
    this.attempts = attempts;
  }
}

// ── Circuit breaker (per serverless instance) ──────────────────────────────
const BREAKER_THRESHOLD = 5; // exhausted failures…
const BREAKER_WINDOW_MS = 60_000; // …within this window
const BREAKER_COOLDOWN_MS = 30_000; // then single attempts for this long

const breaker = { failures: [] as number[], openUntil: 0 };

function breakerOpen(now: number): boolean {
  return now < breaker.openUntil;
}

function recordExhausted(now: number, label: string) {
  breaker.failures = breaker.failures.filter((t) => now - t < BREAKER_WINDOW_MS);
  breaker.failures.push(now);
  if (breaker.failures.length >= BREAKER_THRESHOLD && !breakerOpen(now)) {
    breaker.openUntil = now + BREAKER_COOLDOWN_MS;
    console.error(`[supabase] ${label}: ${breaker.failures.length} failed requests in ${BREAKER_WINDOW_MS / 1000}s — retries paused for ${BREAKER_COOLDOWN_MS / 1000}s`);
  }
}

function recordSuccess() {
  breaker.failures = [];
  breaker.openUntil = 0;
}

/** For tests. */
export function resetCircuitBreaker() {
  recordSuccess();
}

function retryAfterMs(res: Response, now: number): number | null {
  const header = res.headers.get("retry-after");
  if (!header) return null;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(header);
  return Number.isNaN(date) ? null : Math.max(0, date - now);
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Like fetch(), but retries transient failures and returns a Response whose
 * body is already buffered. Throws `TransientFetchError` when every attempt
 * failed at the network level; HTTP error responses are returned, not thrown.
 */
export async function resilientFetch(input: string, init: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {}, options: ResilientFetchOptions): Promise<Response> {
  const method = (init.method ?? "GET").toUpperCase();
  const idempotent = options.idempotent ?? (method === "GET" || method === "HEAD");
  const sleep = options.sleep ?? defaultSleep;
  const random = options.random ?? Math.random;
  const base = options.baseDelayMs ?? 150;
  const cap = options.maxDelayMs ?? 1500;
  const timeoutMs = options.timeoutMs ?? 8000;
  const maxRetries = idempotent && !breakerOpen(Date.now()) ? (options.retries ?? 2) : 0;

  let lastCode = "UNKNOWN";
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const timeout = AbortSignal.timeout(timeoutMs);
    const signal = init.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
    let delay: number | null = null;
    try {
      const res = await fetch(input, { ...init, signal });
      const body = await res.arrayBuffer();
      const buffered = new Response(res.status === 204 || res.status === 304 ? null : body, {
        status: res.status,
        statusText: res.statusText,
        headers: res.headers,
      });
      if (!isRetryableStatus(res.status) || attempt === maxRetries) {
        if (res.ok || !isRetryableStatus(res.status)) {
          recordSuccess(); // the service answered; the connection path is fine
          if (attempt > 0) console.info(`[supabase] ${options.label}: recovered on attempt ${attempt + 1}`);
        } else {
          recordExhausted(Date.now(), options.label);
          console.error(`[supabase] ${options.label}: HTTP ${res.status} after ${attempt + 1} attempt${attempt ? "s" : ""}`);
        }
        return buffered;
      }
      lastCode = `HTTP_${res.status}`;
      const wait = retryAfterMs(res, Date.now());
      if (wait !== null) {
        if (wait > cap * 2) return buffered; // the server asked for longer than we can wait in a request
        delay = wait;
      }
    } catch (err) {
      const code = transientErrorCode(err);
      if (!code || init.signal?.aborted) throw err;
      lastCode = code;
      lastError = err;
      if (attempt === maxRetries) break;
    }
    const backoff = delay ?? Math.round(random() * Math.min(cap, base * 2 ** attempt));
    console.warn(`[supabase] ${options.label}: attempt ${attempt + 1} failed (${lastCode}); retrying in ${backoff}ms`);
    await sleep(backoff);
  }

  recordExhausted(Date.now(), options.label);
  const error = new TransientFetchError(options.label, lastCode, maxRetries + 1, lastError);
  console.error(`[supabase] ${error.message}`);
  throw error;
}
