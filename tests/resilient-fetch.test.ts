// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TransientFetchError, resetCircuitBreaker, resilientFetch, transientErrorCode } from "@/lib/server/resilient-fetch";

/** The exact error shapes seen in production logs (undici). */
function otherSideClosed() {
  const cause = Object.assign(new Error("other side closed"), { code: "UND_ERR_SOCKET" });
  return new TypeError("fetch failed", { cause });
}
function writeTimedOut() {
  const cause = Object.assign(new Error("write ETIMEDOUT"), { code: "ETIMEDOUT", syscall: "write" });
  return new TypeError("fetch failed", { cause });
}
function terminatedWhileReading(): Response {
  // Headers arrived, then the connection reset while the body streamed.
  const body = new ReadableStream({
    pull() {
      throw Object.assign(new TypeError("terminated"), { cause: Object.assign(new Error("read ECONNRESET"), { code: "ECONNRESET" }) });
    },
  });
  return new Response(body, { status: 200 });
}

const ok = () => new Response(JSON.stringify([{ id: 1 }]), { status: 200, headers: { "content-type": "application/json" } });
const noSleep = { sleep: async () => {}, random: () => 0.5 };

describe("resilientFetch", () => {
  let warn: ReturnType<typeof vi.spyOn>;
  let error: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    resetCircuitBreaker();
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    error = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("recovers from a stale pooled connection ('other side closed') on the next attempt", async () => {
    const fetchMock = vi.fn().mockRejectedValueOnce(otherSideClosed()).mockResolvedValueOnce(ok());
    vi.stubGlobal("fetch", fetchMock);
    const res = await resilientFetch("https://x.supabase.co/rest/v1/inventory", {}, { label: "t", ...noSleep });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([{ id: 1 }]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[0][0]).toContain("UND_ERR_SOCKET");
  });

  it("retries write timeouts and resets that happen while reading the body", async () => {
    const fetchMock = vi.fn().mockRejectedValueOnce(writeTimedOut()).mockResolvedValueOnce(terminatedWhileReading()).mockResolvedValueOnce(ok());
    vi.stubGlobal("fetch", fetchMock);
    const res = await resilientFetch("https://x/rest", {}, { label: "t", ...noSleep });
    expect(await res.json()).toEqual([{ id: 1 }]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("times out a hung attempt and retries it", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementationOnce((_url: string, init: RequestInit) => new Promise((_, reject) => init.signal?.addEventListener("abort", () => reject(init.signal?.reason))))
      .mockResolvedValueOnce(ok());
    vi.stubGlobal("fetch", fetchMock);
    const res = await resilientFetch("https://x/rest", {}, { label: "t", timeoutMs: 20, ...noSleep });
    expect(res.status).toBe(200);
    expect(warn.mock.calls[0][0]).toContain("TIMEOUT");
  });

  it("retries Supabase 500/503 responses", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("{}", { status: 503 }))
      .mockResolvedValueOnce(new Response("{}", { status: 500 }))
      .mockResolvedValueOnce(ok());
    vi.stubGlobal("fetch", fetchMock);
    expect((await resilientFetch("https://x/rest", {}, { label: "t", ...noSleep })).status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("honours a short Retry-After on 429 and gives up immediately on a long one", async () => {
    const sleep = vi.fn(async () => {});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(new Response("{}", { status: 429, headers: { "retry-after": "1" } })).mockResolvedValueOnce(ok()));
    expect((await resilientFetch("https://x/rest", {}, { label: "t", sleep, maxDelayMs: 1500 })).status).toBe(200);
    expect(sleep).toHaveBeenCalledWith(1000);

    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 429, headers: { "retry-after": "120" } }));
    vi.stubGlobal("fetch", fetchMock);
    const res = await resilientFetch("https://x/rest", {}, { label: "t", ...noSleep });
    expect(res.status).toBe(429);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("never retries invalid credentials, permission errors or bad queries", async () => {
    for (const status of [400, 401, 403, 404, 416]) {
      const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: "nope" }), { status }));
      vi.stubGlobal("fetch", fetchMock);
      const res = await resilientFetch("https://x/rest", {}, { label: "t", ...noSleep });
      expect(res.status).toBe(status);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    }
    expect(warn).not.toHaveBeenCalled();
  });

  it("does not retry non-idempotent writes unless the caller opts in", async () => {
    const fetchMock = vi.fn().mockRejectedValue(otherSideClosed());
    vi.stubGlobal("fetch", fetchMock);
    await expect(resilientFetch("https://x/rest", { method: "POST", body: "{}" }, { label: "t", ...noSleep })).rejects.toBeInstanceOf(TransientFetchError);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fetchMock.mockReset().mockRejectedValueOnce(otherSideClosed()).mockResolvedValueOnce(new Response("[]", { status: 201 }));
    expect((await resilientFetch("https://x/rest", { method: "POST", body: "{}" }, { label: "t", idempotent: true, ...noSleep })).status).toBe(201);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("throws a clear error after exhausting retries, without logging URLs", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(otherSideClosed()));
    const err = await resilientFetch("https://secret-host.supabase.co/rest/v1/leads?email=eq.a@b.co", {}, { label: "leads.select", ...noSleep }).catch((e) => e);
    expect(err).toBeInstanceOf(TransientFetchError);
    expect(err.attempts).toBe(3);
    expect(err.code).toBe("UND_ERR_SOCKET");
    const logged = [...warn.mock.calls, ...error.mock.calls].flat().join(" ");
    expect(logged).not.toContain("secret-host");
    expect(logged).not.toContain("a@b.co");
  });

  it("stops retrying during an outage (circuit breaker) so failures don't multiply traffic", async () => {
    const fetchMock = vi.fn().mockRejectedValue(otherSideClosed());
    vi.stubGlobal("fetch", fetchMock);
    for (let i = 0; i < 5; i++) await resilientFetch("https://x/rest", {}, { label: "t", ...noSleep }).catch(() => {});
    expect(fetchMock).toHaveBeenCalledTimes(15);
    fetchMock.mockClear();
    await resilientFetch("https://x/rest", {}, { label: "t", ...noSleep }).catch(() => {});
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // A successful response closes the breaker again.
    fetchMock.mockReset().mockResolvedValueOnce(ok()).mockRejectedValueOnce(otherSideClosed()).mockResolvedValueOnce(ok());
    await resilientFetch("https://x/rest", {}, { label: "t", ...noSleep });
    expect((await resilientFetch("https://x/rest", {}, { label: "t", ...noSleep })).status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("does not retry when the caller aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    const fetchMock = vi.fn().mockRejectedValue(Object.assign(new Error("aborted"), { name: "AbortError" }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(resilientFetch("https://x/rest", { signal: controller.signal }, { label: "t", ...noSleep })).rejects.toThrow("aborted");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("classifies errors", () => {
    expect(transientErrorCode(otherSideClosed())).toBe("UND_ERR_SOCKET");
    expect(transientErrorCode(writeTimedOut())).toBe("ETIMEDOUT");
    expect(transientErrorCode(new TypeError("fetch failed", { cause: Object.assign(new Error("cert"), { code: "CERT_HAS_EXPIRED" }) }))).toBeNull();
    expect(transientErrorCode(new SyntaxError("Unexpected token"))).toBeNull();
  });
});
