import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { supabaseUpsert } from "@/lib/supabase";
import { dealerConfig } from "@/dealer.config";
import { getInventory } from "@/lib/data/inventory-source";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AgentPageResponse {
  meta_title: string;
  h1_heading: string;
  page_content_html: string;
}

interface GeoLandingPage extends AgentPageResponse {
  city: string;
  state: string;
}

type ErrorStage = "config" | "inventory" | "anthropic" | "supabase" | "unknown";
type FetchFailureKind =
  | "dns"
  | "connection"
  | "timeout"
  | "tls"
  | "abort"
  | "http"
  | "unknown";

interface FetchFailureDetails {
  kind: FetchFailureKind;
  message: string;
  code?: string;
  syscall?: string;
  hostname?: string;
}

class StageError extends Error {
  readonly stage: ErrorStage;
  readonly details: Record<string, unknown>;
  constructor(stage: ErrorStage, message: string, details: Record<string, unknown> = {}) {
    super(message);
    this.name = "StageError";
    this.stage = stage;
    this.details = details;
  }
}

// ---------------------------------------------------------------------------
// Error classification — distinguish DNS / connection / timeout / TLS / HTTP
// ---------------------------------------------------------------------------

function classifyFetchError(err: unknown): FetchFailureDetails {
  if (!(err instanceof Error)) {
    return { kind: "unknown", message: String(err) };
  }
  // Node's undici-based fetch wraps the real network failure on err.cause.
  const cause = (err as Error & { cause?: unknown }).cause;
  const causeObj =
    cause && typeof cause === "object" ? (cause as Record<string, unknown>) : null;

  const code =
    (typeof causeObj?.code === "string" ? (causeObj.code as string) : undefined) ??
    ((err as Error & { code?: string }).code as string | undefined);
  const syscall =
    typeof causeObj?.syscall === "string" ? (causeObj.syscall as string) : undefined;
  const hostname =
    typeof causeObj?.hostname === "string" ? (causeObj.hostname as string) : undefined;
  const causeMessage =
    typeof causeObj?.message === "string" ? (causeObj.message as string) : undefined;

  let kind: FetchFailureKind = "unknown";
  if (code === "ENOTFOUND" || code === "EAI_AGAIN") kind = "dns";
  else if (
    code === "ECONNREFUSED" ||
    code === "ECONNRESET" ||
    code === "EHOSTUNREACH" ||
    code === "ENETUNREACH" ||
    code === "EPIPE"
  )
    kind = "connection";
  else if (
    code === "ETIMEDOUT" ||
    code === "UND_ERR_CONNECT_TIMEOUT" ||
    code === "UND_ERR_HEADERS_TIMEOUT" ||
    code === "UND_ERR_BODY_TIMEOUT" ||
    code === "UND_ERR_SOCKET_TIMEOUT"
  )
    kind = "timeout";
  else if (
    typeof code === "string" &&
    (code === "DEPTH_ZERO_SELF_SIGNED_CERT" ||
      code.startsWith("CERT_") ||
      code.startsWith("ERR_TLS_") ||
      code.startsWith("ERR_SSL_"))
  )
    kind = "tls";
  else if (err.name === "AbortError" || code === "UND_ERR_ABORTED" || code === "ABORT_ERR")
    kind = "abort";

  return {
    kind,
    message: causeMessage ? `${err.message}: ${causeMessage}` : err.message,
    code,
    syscall,
    hostname,
  };
}

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "<invalid URL>";
  }
}

function getAnthropicBaseUrl(): string {
  return (process.env.ANTHROPIC_API_BASE_URL ?? "https://api.anthropic.com/v1").replace(/\/$/, "");
}

function getAnthropicModel(): string {
  return process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";
}

// ---------------------------------------------------------------------------
// Anthropic helper with retry
// ---------------------------------------------------------------------------

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  stage: ErrorStage,
  maxAttempts = 3
): Promise<Response> {
  let lastFailure: FetchFailureDetails = { kind: "unknown", message: "Unknown error" };
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      // Retry only on 429 / 5xx — return 4xx (e.g. 401, 403, 404) to caller for handling.
      if (res.status < 500 && res.status !== 429) return res;
      lastFailure = {
        kind: "http",
        message: `HTTP ${res.status}`,
        code: String(res.status),
      };
      console.error(
        `[${stage}] retryable HTTP ${res.status} on attempt ${attempt}/${maxAttempts} host=${safeHostname(url)}`
      );
    } catch (err) {
      lastFailure = classifyFetchError(err);
      console.error(
        `[${stage}] fetch threw on attempt ${attempt}/${maxAttempts} kind=${lastFailure.kind}` +
          (lastFailure.code ? ` code=${lastFailure.code}` : "") +
          (lastFailure.hostname ? ` host=${lastFailure.hostname}` : ` host=${safeHostname(url)}`) +
          `: ${lastFailure.message}`
      );
    }
    if (attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, 2 ** attempt * 1000)); // 2s, 4s
    }
  }
  throw new StageError(
    stage,
    `${stage} fetch failed after ${maxAttempts} attempts (${lastFailure.kind}` +
      `${lastFailure.code ? `, ${lastFailure.code}` : ""})`,
    {
      kind: lastFailure.kind,
      code: lastFailure.code,
      syscall: lastFailure.syscall,
      hostname: lastFailure.hostname ?? safeHostname(url),
      attempts: maxAttempts,
      cause_message: lastFailure.message,
    }
  );
}

async function runAnthropicAgent(city: string, state: string): Promise<AgentPageResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const apiBase = getAnthropicBaseUrl();
  const apiHost = safeHostname(apiBase);
  const model = getAnthropicModel();

  console.log(
    `[generate-city-page] Anthropic config base_url=${apiBase} host=${apiHost} model=${model} api_key_present=${Boolean(apiKey)}`
  );

  if (!apiKey) {
    throw new StageError("config", "Missing ANTHROPIC_API_KEY environment variable", {
      anthropic_base_url: apiBase,
      anthropic_host: apiHost,
      anthropic_model: model,
      anthropic_api_key_present: false,
    });
  }

  // Pull a snapshot of current inventory to give the agent real context.
  // Failures here are inventory/Supabase-side, not provider-side — tag clearly.
  let vehicles: Awaited<ReturnType<typeof getInventory>>["vehicles"] = [];
  let total = 0;
  try {
    const inventory = await getInventory({ perPage: 12, sortBy: "date-added" });
    vehicles = inventory.vehicles;
    total = inventory.total;
    console.log(
      `[generate-city-page] inventory snapshot vehicles=${vehicles.length} total=${total}`
    );
  } catch (err) {
    const details = classifyFetchError(err);
    console.error(
      `[generate-city-page] Supabase inventory fetch failed kind=${details.kind}` +
        (details.code ? ` code=${details.code}` : "") +
        (details.hostname ? ` host=${details.hostname}` : "") +
        `: ${details.message}`
    );
    throw new StageError("inventory", "Supabase inventory fetch failed", {
      kind: details.kind,
      code: details.code,
      hostname: details.hostname,
      cause_message: details.message,
    });
  }

  const inventorySnapshot = vehicles
    .slice(0, 8)
    .map((v) => `${v.year} ${v.make} ${v.model}${v.trim ? " " + v.trim : ""} — $${v.price.toLocaleString()}`)
    .join("; ");

  const featuredMakesList = [...new Set(vehicles.map((v) => v.make))].slice(0, 6).join(", ");
  const { stats } = dealerConfig;

  const prompt = [
    "You are an expert automotive SEO copywriter specializing in local search for used car dealerships.",
    `Write a complete SEO-optimized landing page for Speedway Motors LLC, a used car dealership serving customers from ${city}, ${state}.`,
    "",
    "DEALER CONTEXT:",
    `- Name: Speedway Motors LLC`,
    `- Location: 302-304 22nd Ave, Paterson, NJ 07513 (${city} is a nearby market)`,
    `- Established: 2005 (${stats.yearsInBusiness} years in business)`,
    `- Google Rating: ${stats.googleRating}/5 from ${stats.totalReviews}+ reviews`,
    `- Total inventory: ${total}+ quality pre-owned vehicles`,
    `- Available makes include: ${featuredMakesList}`,
    `- Sample current inventory: ${inventorySnapshot}`,
    `- Financing: available for all credit levels including bad credit and first-time buyers`,
    `- Services: used car sales, auto financing, vehicle trade-ins, commercial vehicle sales`,
    "",
    "CONTENT REQUIREMENTS:",
    "1. The page must target buyers searching from " + city + ", " + state + " who are willing to drive to Paterson, NJ.",
    "2. Naturally weave in geographic references to " + city + " and its surrounding neighborhoods.",
    "3. Include at least one paragraph on financing options (mention bad credit / no credit welcome).",
    "4. Include at least one paragraph on trade-in value.",
    "5. Reference real makes/models from the inventory snapshot above to show live availability.",
    "6. Include an internal link anchor tag to the inventory page: <a href=\"/inventory\">browse our full inventory</a>.",
    "7. Include an internal link to the financing page: <a href=\"/finance\">apply for financing</a>.",
    "8. Structure the HTML content with H2 and H3 subheadings (never H1 — that is provided separately).",
    "9. Aim for 400–600 words of body content.",
    "10. Do NOT include a CTA button or form — the page template handles those.",
    "",
    "OUTPUT FORMAT:",
    "Return ONLY a raw JSON object (no markdown fences) with exactly these three keys:",
    "  meta_title   — 55–60 characters, includes city name and primary keyword",
    "  h1_heading   — 60–80 characters, compelling H1 for the page",
    "  page_content_html — the full HTML body content as a string",
  ].join("\n");

  // Prefill the assistant turn with `{` to coax the model into a strict JSON
  // object response — Anthropic has no native json_object mode, so prefill is
  // the standard pattern. The returned content[0].text continues after `{`.
  let res: Response;
  try {
    res = await fetchWithRetry(
      `${apiBase}/messages`,
      {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens: 4096,
          messages: [
            { role: "user", content: prompt },
            { role: "assistant", content: "{" },
          ],
        }),
      },
      "anthropic",
      3
    );
  } catch (err) {
    // Annotate StageError from fetchWithRetry with Anthropic context before re-throw.
    if (err instanceof StageError) {
      err.details.anthropic_base_url = apiBase;
      err.details.anthropic_host = apiHost;
      err.details.anthropic_model = model;
      err.details.anthropic_api_key_present = true;
    }
    throw err;
  }

  if (!res.ok) {
    const rawBody = await res.text().catch(() => "");
    const bodyPreview = rawBody.length > 300 ? `${rawBody.slice(0, 300)}…` : rawBody;
    console.error(
      `[generate-city-page] Anthropic HTTP ${res.status} host=${apiHost} model=${model} body="${bodyPreview}"`
    );
    throw new StageError("anthropic", `Anthropic API returned HTTP ${res.status}`, {
      kind: "http",
      status: res.status,
      body_preview: bodyPreview,
      anthropic_base_url: apiBase,
      anthropic_host: apiHost,
      anthropic_model: model,
      anthropic_api_key_present: true,
    });
  }

  let envelope: unknown;
  try {
    envelope = await res.json();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new StageError("anthropic", "Anthropic response envelope was not valid JSON", {
      anthropic_base_url: apiBase,
      anthropic_host: apiHost,
      anthropic_model: model,
      cause_message: message,
    });
  }

  // Anthropic Messages API: { content: [{ type: "text", text: "..." }, ...], stop_reason, ... }
  const content =
    envelope && typeof envelope === "object"
      ? (envelope as { content?: Array<{ type?: string; text?: string }> }).content
      : undefined;
  const stopReason =
    envelope && typeof envelope === "object"
      ? (envelope as { stop_reason?: string }).stop_reason
      : undefined;
  const text = Array.isArray(content)
    ? content.find((c) => c?.type === "text")?.text ?? ""
    : "";
  if (!text) {
    throw new StageError("anthropic", "Anthropic response had no text content", {
      anthropic_base_url: apiBase,
      anthropic_host: apiHost,
      anthropic_model: model,
      stop_reason: stopReason,
    });
  }

  // The model continues after the prefilled `{`, so re-attach it before parsing.
  const jsonText = text.startsWith("{") ? text : `{${text}`;
  let parsed: Partial<AgentPageResponse> | null;
  try {
    parsed = JSON.parse(jsonText) as Partial<AgentPageResponse>;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const preview = jsonText.length > 300 ? `${jsonText.slice(0, 300)}…` : jsonText;
    throw new StageError("anthropic", "Anthropic content was not valid JSON", {
      anthropic_base_url: apiBase,
      anthropic_host: apiHost,
      anthropic_model: model,
      stop_reason: stopReason,
      content_preview: preview,
      cause_message: message,
    });
  }

  if (!parsed || !parsed.meta_title || !parsed.h1_heading || !parsed.page_content_html) {
    throw new StageError(
      "anthropic",
      "Anthropic response missing required fields (meta_title, h1_heading, page_content_html)",
      {
        anthropic_base_url: apiBase,
        anthropic_host: apiHost,
        anthropic_model: model,
        stop_reason: stopReason,
      }
    );
  }

  return parsed as AgentPageResponse;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    // 1. Allow either an authenticated admin OR an internal cron request.
    //    Cron bypass requires CRON_SECRET to be set; otherwise cron is rejected.
    const cronSecret = process.env.CRON_SECRET;
    const cronHeader = request.headers.get("x-cron-secret");
    const isCronRequest = Boolean(cronSecret && cronHeader === cronSecret);
    const isAdmin = await isAdminAuthenticated();

    if (!isAdmin && !isCronRequest) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const authSource = isAdmin ? "admin" : "cron";

    // 2. Parse & validate input
    const body = (await request.json()) as Record<string, unknown>;
    const city = String(body.city || "").trim();
    const state = String(body.state || "").trim();
    const dryRun = body.dry_run === true;

    if (!city || !state) {
      return NextResponse.json(
        { message: "Both city and state are required" },
        { status: 400 }
      );
    }

    console.log(
      `[generate-city-page] start city="${city}" state="${state}" auth=${authSource} dry_run=${dryRun}`
    );

    // 3. Generate content via Anthropic Messages API
    let agentData: AgentPageResponse;
    try {
      agentData = await runAnthropicAgent(city, state);
      console.log(
        `[generate-city-page] Anthropic ok city="${city}" state="${state}"`
      );
    } catch (err) {
      if (err instanceof StageError) {
        console.error(
          `[generate-city-page] stage=${err.stage} failed city="${city}" state="${state}": ${err.message}`,
          err.details
        );
        const status = err.stage === "config" ? 500 : 502;
        return NextResponse.json(
          { message: err.message, stage: err.stage, ...err.details },
          { status }
        );
      }
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        `[generate-city-page] Anthropic failed (unclassified) city="${city}" state="${state}": ${message}`
      );
      throw err;
    }

    // 4. Dry run — return preview without saving
    if (dryRun) {
      console.log(
        `[generate-city-page] dry_run complete city="${city}" state="${state}" auth=${authSource}`
      );
      return NextResponse.json({ ok: true, dry_run: true, preview: agentData });
    }

    // 5. Upsert into Supabase (city+state as natural composite key)
    const row: Record<string, unknown> = {
      city,
      state,
      meta_title: agentData.meta_title,
      h1_heading: agentData.h1_heading,
      page_content_html: agentData.page_content_html,
    };

    const { data, error } = await supabaseUpsert<GeoLandingPage>(
      "geo_landing_pages",
      [row],
      "city,state"
    );

    if (error) {
      console.error(
        `[generate-city-page] Supabase upsert failed city="${city}" state="${state}":`,
        error
      );
      return NextResponse.json(
        { message: "Failed to save landing page", stage: "supabase", detail: error },
        { status: 500 }
      );
    }

    console.log(
      `[generate-city-page] Supabase upsert ok city="${city}" state="${state}"`
    );

    // 6. Invalidate ISR cache for the affected location page(s)
    //    Slug is derived by converting "Jersey City" → "jersey-city-nj"
    const citySlug = city.toLowerCase().replace(/\s+/g, "-");
    const stateAbbr = state.length === 2 ? state.toLowerCase() : state.slice(0, 2).toLowerCase();
    revalidatePath(`/locations/${citySlug}-${stateAbbr}`);
    revalidatePath("/locations");

    console.log(
      `[generate-city-page] done city="${city}" state="${state}" auth=${authSource}`
    );

    return NextResponse.json({
      ok: true,
      page: data?.[0] ?? row,
    });
  } catch (err) {
    if (err instanceof StageError) {
      console.error(
        `[generate-city-page] uncaught stage=${err.stage}: ${err.message}`,
        err.details
      );
      const status = err.stage === "config" ? 500 : 502;
      return NextResponse.json(
        { message: err.message, stage: err.stage, ...err.details },
        { status }
      );
    }
    console.error("generate-city-page error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ message, stage: "unknown" }, { status: 500 });
  }
}
