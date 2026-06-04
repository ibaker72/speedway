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

// The model returns these seven plain-text fields via tool use; the route
// then assembles page_content_html deterministically from them.
interface GeoPageSections {
  meta_title: string;
  h1_heading: string;
  intro_paragraph: string;
  inventory_paragraph: string;
  financing_paragraph: string;
  trade_in_paragraph: string;
  why_choose_paragraph: string;
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

// Convert ASCII inch (") and foot (') marks that follow a digit into
// spelled-out form ("159\" WB" → "159-inch WB", "12'" → "12-foot"). Used to
// scrub inventory trim strings before they enter the prompt so the model
// reads clean prose rather than embedded quote chars.
function spellOutInchAndFoot(text: string): string {
  return text
    .replace(/(\d(?:\.\d+)?)\s*"/g, "$1-inch")
    .replace(/(\d(?:\.\d+)?)\s*'/g, "$1-foot");
}

// Anthropic tool schema for the forced tool call. Using a tool sidesteps the
// entire class of JSON-text fragility (unescaped quotes inside HTML strings,
// markdown fences, runaway prose): the API serializes tool_use.input itself
// and returns it as a structured object we can read directly.
const GEO_PAGE_TOOL = {
  name: "generate_geo_landing_page",
  description:
    "Emit the SEO landing-page sections for the requested city as seven " +
    "plain-text fields. The route assembles the final HTML — never emit " +
    "HTML tags, markdown, or inline links inside any field.",
  input_schema: {
    type: "object",
    required: [
      "meta_title",
      "h1_heading",
      "intro_paragraph",
      "inventory_paragraph",
      "financing_paragraph",
      "trade_in_paragraph",
      "why_choose_paragraph",
    ],
    additionalProperties: false,
    properties: {
      meta_title: {
        type: "string",
        description:
          "55–60 characters. Plain text. Includes the city name and the primary keyword.",
      },
      h1_heading: {
        type: "string",
        description: "60–80 characters. Plain text. Compelling H1 heading.",
      },
      intro_paragraph: {
        type: "string",
        description:
          "80–120 words of plain prose. No HTML, no markdown, no links. Welcomes the city's drivers and sets up the page.",
      },
      inventory_paragraph: {
        type: "string",
        description:
          "80–120 words of plain prose. References real makes/models from the inventory snapshot. No HTML, no markdown, no links.",
      },
      financing_paragraph: {
        type: "string",
        description:
          "80–120 words of plain prose covering credit options including bad credit, no credit, and first-time buyers. No HTML, no markdown, no links.",
      },
      trade_in_paragraph: {
        type: "string",
        description:
          "60–100 words of plain prose covering the trade-in process. No HTML, no markdown, no links.",
      },
      why_choose_paragraph: {
        type: "string",
        description:
          "60–100 words of plain prose closing the page. No HTML, no markdown, no links.",
      },
    },
  },
} as const;

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
  // Added after Sonnet tool-use run on Clifton:
  [/\bNearClifton\b/g, "Near Clifton"],
  [/\bnearClifton\b/g, "near Clifton"],
  [/\bReliableused\b/g, "Reliable used"],
  [/\breliableused\b/g, "reliable used"],
  [/\bLookingfor\b/g, "Looking for"],
  [/\blookingfor\b/g, "looking for"],
  [/\bCVTat\b/g, "CVT at"],
  [/\bMakesand\b/g, "Makes and"],
  [/\bmakesand\b/g, "makes and"],
  [/\bSportHybrid\b/g, "Sport Hybrid"],
  [/\bsportHybrid\b/g, "sport Hybrid"],
  [/\bToheavy\b/g, "To heavy"],
  [/\btoheavy\b/g, "to heavy"],
  [/\bOneroof\b/g, "One roof"],
  [/\boneroof\b/g, "one roof"],
  [/\bPathto\b/g, "Path to"],
  [/\bpathto\b/g, "path to"],
  [/\bCurrentvehicle\b/g, "Current vehicle"],
  [/\bcurrentvehicle\b/g, "current vehicle"],
  [/\bCurrentvehicles\b/g, "Current vehicles"],
  [/\bcurrentvehicles\b/g, "current vehicles"],
  [/\bInfrom\b/g, "In from"],
  [/\binfrom\b/g, "in from"],
  [/\bAndthe\b/g, "And the"],
  [/\bandthe\b/g, "and the"],
  [/\bUsput\b/g, "Us put"],
  [/\busput\b/g, "us put"],
  [/\bVehicleat\b/g, "Vehicle at"],
  [/\bvehicleat\b/g, "vehicle at"],
  [/\bVehiclesat\b/g, "Vehicles at"],
  [/\bvehiclesat\b/g, "vehicles at"],
  // Additional pairs from the Sonnet template-driven Clifton dry_run:
  [/\bthanluck\b/g, "than luck"],
  [/\bThanluck\b/g, "Than luck"],
  [/\bincludesa\b/g, "includes a"],
  [/\bIncludesa\b/g, "Includes a"],
  [/\bbadcredit\b/g, "bad credit"],
  [/\bBadcredit\b/g, "Bad credit"],
  [/\binyour\b/g, "in your"],
  [/\bInyour\b/g, "In your"],
  [/\binour\b/g, "in our"],
  [/\bInour\b/g, "In our"],
  [/\bThereis\b/g, "There is"],
  [/\bthereis\b/g, "there is"],
  [/\bgreatvehicle\b/g, "great vehicle"],
  [/\bGreatvehicle\b/g, "Great vehicle"],
  [/\bgreatvehicles\b/g, "great vehicles"],
  [/\bGreatvehicles\b/g, "Great vehicles"],
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

// Validation: scan plain text for tokens that look like two English words
// glued together. A token is suspicious if it is at least 7 chars and
// contains a known SEO/dealer marker as a strict substring while NOT
// being equal to any marker itself (so legit single words like "vehicles"
// and "dealership" are not flagged).
const SUSPICIOUS_MERGE_MARKERS: ReadonlySet<string> = new Set([
  // SEO / dealer vocabulary that almost never appears as the inside of a
  // legitimate compound English word.
  "used", "car", "cars", "vehicle", "vehicles", "inventory",
  "financing", "finance", "credit", "dealer", "dealers", "dealership",
  "dealerships", "makes", "models", "near", "looking", "current",
  "trade", "apply", "browse", "visit", "roof", "path", "hybrid",
  "commercial", "reliable",
  // Geography / proper nouns relevant to this dealer.
  "clifton", "paterson", "newark",
  // Function words frequently found on the right-hand side of a merge.
  "your", "ours", "their", "them", "from", "with", "into", "onto",
  "this", "that", "these", "today", "tomorrow", "whether", "while",
  "every",
]);

// Strict detector: a token is flagged ONLY if it can be split into two halves
// that are BOTH known markers (length ≥ 4). This eliminates the previous
// false positives like "Clifton's", "without", "Tradesman", and "everything"
// — for each of those, only one half is a marker and the other half ("'s",
// "out", "sman", "thing") is not, so they no longer trigger.
function detectSuspiciousMerges(text: string): string[] {
  const tokens = text.match(/[A-Za-z']{8,}/g) ?? [];
  const flagged = new Set<string>();
  for (const token of tokens) {
    const lower = token.toLowerCase();
    if (SUSPICIOUS_MERGE_MARKERS.has(lower)) continue;
    let didFlag = false;
    for (const marker of SUSPICIOUS_MERGE_MARKERS) {
      if (didFlag) break;
      if (marker.length < 4) continue;
      if (lower.length <= marker.length) continue;
      // Marker at start: remainder must itself be a known marker.
      if (lower.startsWith(marker)) {
        const rest = lower.slice(marker.length);
        if (
          rest.length >= 4 &&
          SUSPICIOUS_MERGE_MARKERS.has(rest)
        ) {
          flagged.add(token);
          didFlag = true;
          continue;
        }
      }
      // Marker at end: prefix must itself be a known marker.
      if (lower.endsWith(marker)) {
        const rest = lower.slice(0, lower.length - marker.length);
        if (
          rest.length >= 4 &&
          SUSPICIOUS_MERGE_MARKERS.has(rest)
        ) {
          flagged.add(token);
          didFlag = true;
        }
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

// Strip any HTML / markdown that slipped into a paragraph field despite the
// prompt asking for plain prose. Defensive — the seven tool fields should
// never contain markup, but the model occasionally inserts it.
function stripStrayMarkup(text: string): string {
  return text
    .replace(/<[^>]+>/g, "") // raw HTML tags
    .replace(/\r?\n+/g, " ") // newlines → spaces
    .replace(/\*\*([^*\n]+)\*\*/g, "$1") // **bold**
    .replace(/__([^_\n]+)__/g, "$1") // __bold__
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1$2") // *italic* (not **bold**)
    .replace(/^#{1,6}\s+/gm, "") // # heading
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"); // [text](url) → text
}

// Single-pass cleaner for plain-text paragraph fields. Used to produce the
// strings that will be interpolated into the HTML template.
function normalizeTextSpacing(text: string, anchors: string[]): string {
  let s = text;
  s = stripStrayMarkup(s);
  s = applyKnownBadMerges(s);
  s = anchorAroundProperNouns(s, anchors);
  s = addSpacesAtCaseBoundaries(s);
  s = addSpacesAfterPunctuation(s);
  s = s.replace(/\s{2,}/g, " ").trim();
  return s;
}

// Deterministic HTML template. The route — not the model — controls every
// H2 heading, every inline link, and every paragraph wrapper, so failures
// like "can<a" or "</a>any" cannot occur regardless of model output.
function buildPageContentHtml(
  sections: GeoPageSections,
  ctx: SanitizationContext
): string {
  const city = ctx.city;
  const state = ctx.state;
  return [
    `<p>${sections.intro_paragraph}</p>`,
    `<h2>Quality Used Cars Serving ${city}, ${state}</h2>`,
    `<p>${sections.inventory_paragraph}</p>`,
    `<p>You can <a href="/inventory">browse our full inventory</a> online any time.</p>`,
    `<h2>Auto Financing for ${city} Drivers</h2>`,
    `<p>${sections.financing_paragraph}</p>`,
    `<p>Ready to get started? <a href="/finance">Apply for financing</a> in minutes.</p>`,
    `<h2>Trade In Your Current Vehicle</h2>`,
    `<p>${sections.trade_in_paragraph}</p>`,
    `<h2>Why Choose Speedway Motors LLC</h2>`,
    `<p>${sections.why_choose_paragraph}</p>`,
  ].join("\n");
}

function sanitizeGeneratedGeoPage(
  raw: GeoPageSections,
  ctx: SanitizationContext
): SanitizationResult {
  const anchors = buildProperNounAnchors(ctx.city, ctx.state, ctx.vehicleMakes);

  const cleaned: GeoPageSections = {
    meta_title: normalizeTextSpacing(raw.meta_title, anchors),
    h1_heading: normalizeTextSpacing(raw.h1_heading, anchors),
    intro_paragraph: normalizeTextSpacing(raw.intro_paragraph, anchors),
    inventory_paragraph: normalizeTextSpacing(raw.inventory_paragraph, anchors),
    financing_paragraph: normalizeTextSpacing(raw.financing_paragraph, anchors),
    trade_in_paragraph: normalizeTextSpacing(raw.trade_in_paragraph, anchors),
    why_choose_paragraph: normalizeTextSpacing(raw.why_choose_paragraph, anchors),
  };

  const data: AgentPageResponse = {
    meta_title: cleaned.meta_title,
    h1_heading: cleaned.h1_heading,
    page_content_html: buildPageContentHtml(cleaned, ctx),
  };

  // Detector runs on plain text (paragraphs + headings) so HTML structure
  // doesn't dilute the signal.
  const combined = [
    cleaned.meta_title,
    cleaned.h1_heading,
    cleaned.intro_paragraph,
    cleaned.inventory_paragraph,
    cleaned.financing_paragraph,
    cleaned.trade_in_paragraph,
    cleaned.why_choose_paragraph,
  ].join(" ");
  const warnings = detectSuspiciousMerges(combined);

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
    .map((v) => {
      // Vehicle trims sometimes carry raw inch/foot marks (e.g. "159\" WB",
      // "6'5\" cab"). Spell them out so the string is unambiguous prose
      // before it goes into the prompt.
      const trim = v.trim ? " " + spellOutInchAndFoot(v.trim) : "";
      return `${v.year} ${v.make} ${v.model}${trim} — $${v.price.toLocaleString()}`;
    })
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
    "SECTION REQUIREMENTS:",
    "You will return SEVEN plain-text fields via the generate_geo_landing_page tool. The route assembles the final HTML — your job is to write clean prose for each section.",
    "",
    "EVERY paragraph field must be plain prose only:",
    "- NO HTML tags (no <p>, <a>, <h2>, no \"<\" or \">\" anywhere).",
    "- NO markdown (no **bold**, *italic*, # headings, [text](links), backticks).",
    "- NO inline links — the route inserts the links to /inventory and /finance itself.",
    "- NO bullet lists, headings, or images. Just sentences.",
    "",
    "meta_title — 55–60 characters. Plain text. Includes \"" + city + "\" and a primary keyword (e.g. \"used cars\", \"car financing\").",
    "h1_heading — 60–80 characters. Plain text. Compelling H1.",
    "intro_paragraph — 80–120 words. Welcomes " + city + ", " + state + " drivers. Establishes Speedway Motors LLC as conveniently located in Paterson, NJ with " + stats.yearsInBusiness + " years in business and a " + stats.googleRating + "-star Google rating.",
    "inventory_paragraph — 80–120 words. Describes the breadth and quality of pre-owned inventory. References real makes and models from the snapshot above.",
    "financing_paragraph — 80–120 words. Covers financing for all credit levels — explicitly mention bad credit, no credit, and first-time buyers. Briefly explain the application process.",
    "trade_in_paragraph — 60–100 words. Covers the trade-in process. Emphasizes fair offers and quick appraisals.",
    "why_choose_paragraph — 60–100 words. Closing summary of why " + city + " buyers choose Speedway Motors LLC.",
    "",
    "FORMATTING REQUIREMENTS (strict — apply to every field):",
    "- Put exactly one space between every word. Never run two words together.",
    "  Examples: write \"in " + city + "\" (NOT \"in" + city + "\"); write \"minutes from " + city + "\" (NOT \"minutesfrom " + city + "\"); write \"the greater Paterson area\" (NOT \"thegreater Paterson area\").",
    "- Forbidden specifically: \"Visitus\", \"Whetheryou're\", \"willwork\", \"firstvehicle\", \"reducesyour\", \"multipledealerships\", \"NearClifton\", \"reliableused\", \"Lookingfor\", \"CVTat\", \"Makesand\", \"SportHybrid\", \"toheavy\", \"oneroof\", \"pathto\", \"currentvehicle\", \"infrom\", \"andthe\", \"usput\", \"vehicleat\", \"MotorsLLC\", \"Speedway MotorsLLC\".",
    "- Always put a space between a vehicle's make and model: \"Honda HR-V\" (NOT \"HondaHR-V\"); \"Mercedes-Benz GLC\" (NOT \"Mercedes-BenzGLC\"); \"Toyota RAV4\" (NOT \"ToyotaRAV4\").",
    "- Always write the dealership name as \"Speedway Motors LLC\" with single spaces (NOT \"SpeedwayMotors\", NOT \"MotorsLLC\").",
    "- Always surround \"" + city + "\", \"" + state + "\", \"Paterson\", and \"NJ\" with spaces wherever they appear.",
    "- Put a space after every comma, period, semicolon, and colon before the next word.",
    "",
    "PROOFREAD CHECKLIST — perform internally before invoking the tool:",
    "1. Re-read each paragraph and confirm every adjacent pair of words is separated by exactly one space.",
    "2. Search each paragraph for any token of 8 or more characters that contains two recognisable English words back-to-back (e.g. \"reducesyour\", \"currentvehicle\", \"vehicleat\") and split it.",
    "3. Confirm every vehicle make is followed by a space before its model.",
    "4. Confirm no paragraph contains \"<\", \">\", \"[\", \"]\", \"**\", \"##\", backticks, or any other markup.",
    "5. Confirm \"Speedway Motors LLC\" appears as three space-separated words.",
    "6. If any of the forbidden tokens above appears, fix it and re-check.",
    "Only invoke the tool after every item above passes.",
    "",
    "OUTPUT FORMAT:",
    "Return your output by invoking the generate_geo_landing_page tool with all seven required string fields populated. Do not emit any conversational text — only the tool invocation.",
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
          // Forced tool use — the model MUST call generate_geo_landing_page.
          // The API serializes tool_use.input as structured JSON itself, so
          // we never have to JSON.parse model-emitted text. This removes the
          // entire class of "unescaped quote inside an HTML string" failures.
          tools: [GEO_PAGE_TOOL],
          tool_choice: { type: "tool", name: GEO_PAGE_TOOL.name },
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

  // Anthropic Messages API with tool_choice forced returns:
  //   { content: [{ type: "tool_use", name, id, input: {…} }, …],
  //     stop_reason: "tool_use", … }
  // The model MAY also emit a leading text block (rare under forced choice),
  // which we keep around for diagnostics if no tool_use block appears.
  type AnthropicContentBlock =
    | { type: "text"; text?: string }
    | { type: "tool_use"; name?: string; id?: string; input?: unknown };
  const envelopeObj =
    envelope && typeof envelope === "object"
      ? (envelope as Record<string, unknown>)
      : null;
  const content = envelopeObj?.content as AnthropicContentBlock[] | undefined;
  const stopReason = envelopeObj?.stop_reason as string | undefined;

  const toolUse = Array.isArray(content)
    ? (content.find(
        (c): c is Extract<AnthropicContentBlock, { type: "tool_use" }> =>
          c?.type === "tool_use" && c?.name === GEO_PAGE_TOOL.name
      ) ?? undefined)
    : undefined;

  if (!toolUse) {
    // Diagnostic: surface any text the model emitted instead of calling
    // the tool, so the failure mode is obvious in the response.
    const textPreview = Array.isArray(content)
      ? content
          .filter(
            (c): c is Extract<AnthropicContentBlock, { type: "text" }> =>
              c?.type === "text"
          )
          .map((c) => c.text ?? "")
          .join("\n")
          .slice(0, 300)
      : "";
    throw new StageError(
      "anthropic",
      `Anthropic did not invoke the ${GEO_PAGE_TOOL.name} tool`,
      {
        anthropic_base_url: apiBase,
        anthropic_host: apiHost,
        anthropic_model: model,
        stop_reason: stopReason,
        text_preview: textPreview,
      }
    );
  }

  const rawInput = toolUse.input;
  if (!rawInput || typeof rawInput !== "object") {
    throw new StageError(
      "anthropic",
      `${GEO_PAGE_TOOL.name} tool returned non-object input`,
      {
        anthropic_base_url: apiBase,
        anthropic_host: apiHost,
        anthropic_model: model,
        stop_reason: stopReason,
        input_type: typeof rawInput,
      }
    );
  }
  const partial = rawInput as Partial<GeoPageSections>;
  const requiredSectionFields: Array<keyof GeoPageSections> = [
    "meta_title",
    "h1_heading",
    "intro_paragraph",
    "inventory_paragraph",
    "financing_paragraph",
    "trade_in_paragraph",
    "why_choose_paragraph",
  ];
  const missingFields = requiredSectionFields.filter(
    (k) =>
      typeof partial[k] !== "string" || (partial[k] as string).trim().length === 0
  );
  if (missingFields.length > 0) {
    throw new StageError(
      "anthropic",
      `Anthropic tool input missing required string fields: ${missingFields.join(", ")}`,
      {
        anthropic_base_url: apiBase,
        anthropic_host: apiHost,
        anthropic_model: model,
        stop_reason: stopReason,
        missing_fields: missingFields,
      }
    );
  }
  const sections = partial as GeoPageSections;

  const vehicleMakes = vehicles
    .map((v) => v.make)
    .filter((m): m is string => Boolean(m && m.trim().length));

  const result = sanitizeGeneratedGeoPage(sections, {
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
