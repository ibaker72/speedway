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

// Strip the common ways a model can wrap a JSON object even when told not to:
// markdown fences (```json … ``` or ``` … ```), a leading "Here is the JSON:"
// preamble, or trailing prose. Falls back to slicing the first balanced
// {…} block so we still parse usable output instead of bailing on a stray
// preamble.
function stripJsonWrapper(text: string): string {
  let s = text.trim();
  // ```json … ``` or ``` … ``` (case-insensitive language tag)
  const fence = s.match(/^```[a-zA-Z]*\s*\n?([\s\S]*?)\n?\s*```\s*$/);
  if (fence) s = fence[1].trim();
  // If the model added prose on either side of the object, keep only the
  // outermost {…} span. This is a best-effort fallback for slips.
  if (!s.startsWith("{") || !s.endsWith("}")) {
    const first = s.indexOf("{");
    const last = s.lastIndexOf("}");
    if (first !== -1 && last > first) {
      s = s.slice(first, last + 1).trim();
    }
  }
  return s;
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

// ---------------------------------------------------------------------------
// Post-parse sanitizer — repair common spacing artifacts in model output
// ---------------------------------------------------------------------------
//
// Layered defense:
//   (1) Structural rules: case boundaries, punctuation, inline-tag adjacency.
//   (2) Proper-noun anchoring: city, state, dealership name, vehicle makes.
//   (3) Known-bad merge dictionary: lowercase-into-lowercase pairs observed
//       in live runs that no structural rule can detect (e.g. "Visitus",
//       "whetheryou're").
//   (4) Validation pass that emits a warning list of any merged-looking
//       tokens still present, so the dry_run response surfaces them.

const INLINE_TAG = /(?:a|strong|em|b|i|span|u|small|mark)/i;

function addSpacesAtCaseBoundaries(text: string): string {
  // "inClifton" → "in Clifton", "HondaHR-V" → "Honda HR-V". Conservative:
  // only triggers on [a-z] followed by [A-Z], which avoids breaking
  // acronyms like "BMW" and trim codes like "HR-V" themselves.
  return text.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function addSpacesAfterPunctuation(text: string): string {
  // ".Foo" → ". Foo", ",Foo" → ", Foo". Triggers only when the next char
  // is a letter, so numbers like "$15,000" and ellipses stay intact.
  return text.replace(/([.,;:!?])(?=[A-Za-z])/g, "$1 ");
}

function collapseInlineWhitespace(text: string): string {
  return text.replace(/[ \t]{2,}/g, " ");
}

// Known-bad merges — lowercase-into-lowercase pairs the case rule cannot see.
// Both casings (sentence-start + mid-sentence) are listed so each pass is
// case-faithful instead of forcing a single canonical form.
const KNOWN_BAD_MERGES: Array<[RegExp, string]> = [
  [/\bWhetheryou're\b/g, "Whether you're"],
  [/\bWhetheryou\b/g, "Whether you"],
  [/\bwhetheryou're\b/g, "whether you're"],
  [/\bwhetheryou\b/g, "whether you"],
  [/\bMultipledealerships\b/g, "Multiple dealerships"],
  [/\bMultipledealership\b/g, "Multiple dealership"],
  [/\bmultipledealerships\b/g, "multiple dealerships"],
  [/\bmultipledealership\b/g, "multiple dealership"],
  [/\bWillwork\b/g, "Will work"],
  [/\bwillwork\b/g, "will work"],
  [/\bFirstvehicles\b/g, "First vehicles"],
  [/\bFirstvehicle\b/g, "First vehicle"],
  [/\bfirstvehicles\b/g, "first vehicles"],
  [/\bfirstvehicle\b/g, "first vehicle"],
  [/\bReducesyour\b/g, "Reduces your"],
  [/\breducesyour\b/g, "reduces your"],
  [/\bVisitus\b/g, "Visit us"],
  [/\bvisitus\b/g, "visit us"],
  [/\bVisitour\b/g, "Visit our"],
  [/\bvisitour\b/g, "visit our"],
];

function applyKnownBadMerges(text: string): string {
  let s = text;
  for (const [pattern, replacement] of KNOWN_BAD_MERGES) {
    s = s.replace(pattern, replacement);
  }
  return s;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildProperNounAnchors(
  city: string,
  state: string,
  vehicleMakes: string[]
): string[] {
  // Anchors used to detect "letterX" smushes against known proper nouns,
  // e.g. "MotorsLLC" → "Motors LLC", "Patersonto" → "Paterson to".
  return Array.from(
    new Set(
      [
        "Speedway Motors LLC",
        "Speedway Motors",
        "Speedway",
        "LLC",
        city,
        state,
        "Paterson",
        "New Jersey",
        "NJ",
        ...vehicleMakes,
      ]
        .map((n) => n.trim())
        .filter((n) => n.length > 0)
    )
  );
}

function anchorAroundProperNouns(text: string, names: string[]): string {
  let s = text;
  for (const name of names) {
    const escaped = escapeRegExp(name);
    // Letter immediately before the name → insert a space.
    // "ourPaterson" → "our Paterson", "MotorsLLC" → "Motors LLC".
    s = s.replace(new RegExp(`(?<=[A-Za-z])${escaped}\\b`, "g"), ` ${name}`);
    // Name immediately before a lowercase letter → insert a space.
    // "Patersonto" → "Paterson to", "LLCserves" → "LLC serves".
    s = s.replace(new RegExp(`\\b${escaped}(?=[a-z])`, "g"), `${name} `);
  }
  return s;
}

// Validation: scan plain text for tokens that look like English words
// glued together (typically lowercase, ≥12 chars, containing an interior
// substring that is a known standalone word).
function detectSuspiciousMerges(textOrHtml: string): string[] {
  const plain = textOrHtml.replace(/<[^>]+>/g, " ");
  const tokens = plain.match(/[A-Za-z']{12,}/g) ?? [];
  const interiorMarkers = [
    "your", "ours", "their", "them",
    "from", "with", "into", "onto", "this", "that", "these", "today", "tomorrow",
    "whether", "while", "every", "vehicle", "vehicles", "dealership", "dealerships",
    "financing", "credit", "trade",
    "paterson", "clifton", "newark",
  ];
  const flagged = new Set<string>();
  for (const token of tokens) {
    const lower = token.toLowerCase();
    for (const marker of interiorMarkers) {
      const idx = lower.indexOf(marker);
      if (idx > 0 && idx + marker.length <= lower.length) {
        flagged.add(token);
        break;
      }
    }
  }
  return Array.from(flagged);
}

interface SanitizationContext {
  city: string;
  state: string;
  vehicleMakes: string[];
}

interface SanitizationResult {
  data: AgentPageResponse;
  warnings: string[];
}

function sanitizeGeneratedGeoPage(
  raw: AgentPageResponse,
  ctx: SanitizationContext
): SanitizationResult {
  const anchors = buildProperNounAnchors(ctx.city, ctx.state, ctx.vehicleMakes);

  const sanitizePlainText = (text: string): string => {
    let s = text;
    s = applyKnownBadMerges(s);
    s = anchorAroundProperNouns(s, anchors);
    s = addSpacesAtCaseBoundaries(s);
    s = addSpacesAfterPunctuation(s);
    s = s.replace(/\s{2,}/g, " ").trim();
    return s;
  };

  const sanitizeHtml = (html: string): string => {
    let s = html;
    // Word directly butted against an opening inline tag → insert a space.
    s = s.replace(new RegExp(`(\\w)(?=<${INLINE_TAG.source}\\b)`, "gi"), "$1 ");
    // Closing inline tag butted against a word → insert a space.
    s = s.replace(new RegExp(`(</${INLINE_TAG.source}>)(?=\\w)`, "gi"), "$1 ");
    // Walk segments — only mutate text nodes so attribute values like
    // href="…" and class="…" are preserved.
    s = s.replace(/<[^>]+>|[^<]+/g, (segment) => {
      if (segment.startsWith("<")) return segment;
      let t = segment;
      t = applyKnownBadMerges(t);
      t = anchorAroundProperNouns(t, anchors);
      t = addSpacesAtCaseBoundaries(t);
      t = addSpacesAfterPunctuation(t);
      t = collapseInlineWhitespace(t);
      return t;
    });
    return s;
  };

  const data: AgentPageResponse = {
    meta_title: sanitizePlainText(raw.meta_title),
    h1_heading: sanitizePlainText(raw.h1_heading),
    page_content_html: sanitizeHtml(raw.page_content_html),
  };

  const warnings = Array.from(
    new Set([
      ...detectSuspiciousMerges(data.meta_title),
      ...detectSuspiciousMerges(data.h1_heading),
      ...detectSuspiciousMerges(data.page_content_html),
    ])
  );

  return { data, warnings };
}

async function runAnthropicAgent(city: string, state: string): Promise<SanitizationResult> {
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
    "FORMATTING REQUIREMENTS (strict — the output will be rejected if violated):",
    "- Put exactly one space between every word. Never run two words together.",
    "  Examples: write \"in " + city + "\" (NOT \"in" + city + "\"); write \"the greater Paterson area\" (NOT \"thegreater Paterson area\"); write \"minutes from " + city + "\" (NOT \"minutesfrom " + city + "\").",
    "- Forbidden specifically: \"Visitus\", \"Whetheryou're\", \"willwork\", \"firstvehicle\", \"reducesyour\", \"multipledealerships\", \"helping" + city + "\", \"" + city + "to\", \"our" + city + "\", \"MotorsLLC\", \"Speedway MotorsLLC\".",
    "- Always put a space between a vehicle's make and model. Examples: \"Honda HR-V\" (NOT \"HondaHR-V\"); \"Mercedes-Benz GLC\" (NOT \"Mercedes-BenzGLC\"); \"Toyota RAV4\" (NOT \"ToyotaRAV4\").",
    "- Always write the dealership name as \"Speedway Motors LLC\" with single spaces between each word (NOT \"SpeedwayMotors\", NOT \"MotorsLLC\", NOT \"Speedway MotorsLLC\").",
    "- Always surround \"" + city + "\", \"" + state + "\", \"Paterson\", and \"NJ\" with spaces wherever they appear in the prose.",
    "- Always put a space before <a and after </a> when they sit next to words. Example: \"and you can <a href=\\\"/inventory\\\">browse our full inventory</a> any time\" (NOT \"and you can<a href=\\\"/inventory\\\">browse our full inventory</a>any time\").",
    "- Put a space after every comma, period, semicolon, and colon before the next word.",
    "",
    "PROOFREAD CHECKLIST — perform internally before emitting the JSON:",
    "1. Re-read each sentence and confirm every adjacent pair of words is separated by exactly one space.",
    "2. Search the page for any token longer than 12 characters that is all lowercase — if it contains two English words back-to-back (e.g. \"reducesyour\", \"willwork\"), split it.",
    "3. Confirm every vehicle make is followed by a space before its model, and every model is followed by a space before whatever comes next.",
    "4. Confirm every inline <a> tag has a space immediately before \"<a\" and immediately after \"</a>\" if a word sits beside it.",
    "5. Confirm \"Speedway Motors LLC\" appears as three space-separated words with no merging.",
    "6. If any of the forbidden tokens above (Visitus, Whetheryou're, etc.) appears, fix it and re-check.",
    "Only emit JSON after every item above passes.",
    "",
    "OUTPUT FORMAT (strict):",
    "Your entire reply MUST be exactly one raw JSON object and nothing else.",
    "- The first character of your reply must be {",
    "- The last character of your reply must be }",
    "- Do NOT wrap the JSON in markdown code fences (no ``` and no ```json).",
    "- Do NOT include any explanatory prose, headings, or text before or after the JSON.",
    "- Do NOT include comments inside the JSON.",
    "Required keys (exactly these three, no others):",
    "  meta_title   — 55–60 characters, includes city name and primary keyword",
    "  h1_heading   — 60–80 characters, compelling H1 for the page",
    "  page_content_html — the full HTML body content as a string",
  ].join("\n");

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
          // Lower temperature reduces missed-space / smushed-word artifacts
          // in the generated copy without sacrificing meaningful variety.
          temperature: 0.6,
          // No assistant prefill — Sonnet 4.6 and other recent models reject
          // conversations that don't end with a user turn. The strict OUTPUT
          // FORMAT block in the user prompt is what enforces JSON-only output;
          // stripJsonWrapper() defends against the rare wrap-in-fences slip.
          messages: [
            { role: "user", content: prompt },
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

  // No assistant prefill is sent (Sonnet 4.6 forbids it), so the model returns
  // the entire JSON object itself. Strip any markdown fences / surrounding
  // prose the model might add despite the OUTPUT FORMAT instructions.
  const jsonText = stripJsonWrapper(text);
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

  const vehicleMakes = vehicles
    .map((v) => v.make)
    .filter((m): m is string => Boolean(m && m.trim().length));

  const result = sanitizeGeneratedGeoPage(parsed as AgentPageResponse, {
    city,
    state,
    vehicleMakes,
  });

  if (result.warnings.length > 0) {
    console.warn(
      `[generate-city-page] sanitizer flagged ${result.warnings.length} suspicious tokens ` +
        `city="${city}" state="${state}": ${result.warnings.slice(0, 10).join(", ")}` +
        (result.warnings.length > 10 ? " …" : "")
    );
  }

  return result;
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
    let agentResult: SanitizationResult;
    try {
      agentResult = await runAnthropicAgent(city, state);
      console.log(
        `[generate-city-page] Anthropic ok city="${city}" state="${state}" warnings=${agentResult.warnings.length}`
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

    // 4. Dry run — return preview without saving (warnings surfaced as a
    //    sibling field so the preview object itself keeps the strict
    //    { meta_title, h1_heading, page_content_html } contract).
    if (dryRun) {
      console.log(
        `[generate-city-page] dry_run complete city="${city}" state="${state}" auth=${authSource} warnings=${agentResult.warnings.length}`
      );
      return NextResponse.json({
        ok: true,
        dry_run: true,
        preview: agentResult.data,
        ...(agentResult.warnings.length > 0 && { warnings: agentResult.warnings }),
      });
    }

    // 5. Upsert into Supabase (city+state as natural composite key)
    const row: Record<string, unknown> = {
      city,
      state,
      meta_title: agentResult.data.meta_title,
      h1_heading: agentResult.data.h1_heading,
      page_content_html: agentResult.data.page_content_html,
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
