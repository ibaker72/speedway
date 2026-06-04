// ---------------------------------------------------------------------------
// Geo landing page text sanitizer
//
// The Anthropic Messages API returns the seven SEO sections as plain-text
// fields via tool use. The model occasionally fuses adjacent words together
// or drops the space after punctuation. This module turns the raw fields
// into clean prose using a layered, deterministic pipeline:
//
//   (1) Strip stray HTML / markdown.
//   (2) Apply a curated dictionary of known bad two-word merges
//       ("ashort" → "a short", "ofthe" → "of the").
//   (3) Insert spacing around proper-noun anchors (dealership name, city,
//       state, vehicle makes).
//   (4) Re-case proper nouns to their canonical form ("newark" → "Newark").
//   (5) Apply generic structural rules: case boundary, post-punctuation,
//       digit-into-word, trim/drivetrain tokens.
//   (6) Validate: scan for any remaining suspicious-looking merged tokens.
//
// All steps are pure functions on strings. The route is thin: it gathers
// context, calls sanitizeGeneratedGeoPage, and emits the result. Tests live
// in scripts/test-geo-sanitize.ts and exercise every documented case from
// the brief.
// ---------------------------------------------------------------------------

export interface GeoPageSections {
  meta_title: string;
  h1_heading: string;
  intro_paragraph: string;
  inventory_paragraph: string;
  financing_paragraph: string;
  trade_in_paragraph: string;
  why_choose_paragraph: string;
}

export interface AgentPageResponse {
  meta_title: string;
  h1_heading: string;
  page_content_html: string;
}

export interface SanitizationContext {
  city: string;
  state: string;
  vehicleMakes: string[];
}

export interface SanitizationResult {
  data: AgentPageResponse;
  warnings: string[];
}

// ---------------------------------------------------------------------------
// Input normalisation — every downstream consumer (prompt, sanitizer,
// Supabase upsert, revalidatePath) should see the canonical title-cased
// city and the canonical uppercased two-letter state, regardless of what
// the caller sent.
// ---------------------------------------------------------------------------

function toTitleCase(input: string): string {
  return input
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeCity(input: string): string {
  return toTitleCase(input);
}

export function normalizeState(input: string): string {
  const trimmed = input.trim();
  // Two-letter postal codes (NJ, NY, CA) — uppercase. Anything longer
  // ("new jersey") — title-case.
  if (trimmed.length === 2) return trimmed.toUpperCase();
  return toTitleCase(trimmed);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function capitalize(word: string): string {
  if (!word) return word;
  return word[0].toUpperCase() + word.slice(1);
}

// Spell out ASCII inch (") and foot (') marks when they follow a digit.
// "159\" WB" → "159-inch WB"; "12'" → "12-foot". Used to scrub inventory
// trim strings before they enter the prompt.
export function spellOutInchAndFoot(text: string): string {
  return text
    .replace(/(\d(?:\.\d+)?)\s*"/g, "$1-inch")
    .replace(/(\d(?:\.\d+)?)\s*'/g, "$1-foot");
}

// ---------------------------------------------------------------------------
// (1) Stray-markup stripper
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// (2) Known bad-merge dictionary
//
// Each entry is a [first, second] pair the model commonly fuses. The
// pipeline auto-generates both the lowercase variant ("ashort") and the
// sentence-start variant ("Ashort") so the dictionary stays compact.
// ---------------------------------------------------------------------------

const BAD_MERGE_PAIRS: ReadonlyArray<readonly [string, string]> = [
  // Function-word smushes — observed across Clifton & Newark dry-runs.
  ["a", "short"],
  ["and", "the"],
  ["of", "the"],
  ["in", "from"],
  ["in", "your"],
  ["in", "our"],
  ["us", "put"],
  ["range", "of"],
  ["one", "of"],
  ["path", "to"],
  ["to", "heavy"],
  ["than", "luck"],
  ["includes", "a"],
  ["one", "roof"],
  ["there", "is"],

  // Verb / adjective + common noun.
  ["looking", "for"],
  ["finding", "your"],
  ["finding", "the"],
  ["visit", "us"],
  ["visit", "our"],
  ["will", "work"],
  ["reduces", "your"],

  // Possessive / adjective + dealership / inventory nouns.
  ["our", "diverse"],
  ["our", "team"],
  ["bad", "credit"],
  ["no", "credit"],
  ["good", "credit"],
  ["loan", "terms"],
  ["finance", "team"],
  ["great", "vehicle"],
  ["great", "vehicles"],
  ["current", "vehicle"],
  ["current", "vehicles"],
  ["first", "vehicle"],
  ["first", "vehicles"],
  ["used", "cars"],
  ["used", "car"],
  ["reliable", "used"],
  ["multiple", "dealerships"],
  ["multiple", "dealership"],
  ["community", "places"],
  ["vehicle", "at"],
  ["vehicles", "at"],
  ["sport", "Hybrid"],
  ["Makes", "and"],
  ["whether", "you"],
  ["whether", "you're"],
  ["their", "very"],
];

interface CompiledMerge {
  pattern: RegExp;
  replacement: string;
}

function compileMergePair([first, second]: readonly [string, string]): CompiledMerge[] {
  // Build BOTH variants: lowercase first word (mid-sentence) and capitalised
  // first word (sentence start). The second word's casing is kept as written
  // so proper nouns like "Paterson" or "Newark" survive.
  const firstLower = first.toLowerCase();
  const firstCap = capitalize(firstLower);
  const merges: CompiledMerge[] = [];

  for (const variant of [firstLower, firstCap]) {
    const fused = escapeRegExp(variant + second);
    merges.push({
      pattern: new RegExp(`\\b${fused}\\b`, "g"),
      replacement: `${variant} ${second}`,
    });
  }
  return merges;
}

const COMPILED_BAD_MERGES: ReadonlyArray<CompiledMerge> = BAD_MERGE_PAIRS.flatMap(
  compileMergePair
);

function applyKnownBadMerges(text: string): string {
  let s = text;
  for (const { pattern, replacement } of COMPILED_BAD_MERGES) {
    s = s.replace(pattern, replacement);
  }
  return s;
}

// ---------------------------------------------------------------------------
// (3) Proper-noun anchor pass
//
// Inserts a space whenever a letter sits immediately adjacent to a known
// anchor — dealership name, city, state, vehicle makes, surrounding cities.
// Matching is case-insensitive; the replacement uses the canonical casing
// of the anchor itself.
// ---------------------------------------------------------------------------

export function buildProperNounAnchors(
  city: string,
  state: string,
  vehicleMakes: string[]
): string[] {
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

function sortByLengthDescending(names: string[]): string[] {
  return [...names].sort((a, b) => b.length - a.length);
}

function anchorAroundProperNouns(text: string, names: string[]): string {
  let s = text;
  for (const name of sortByLengthDescending(names)) {
    const escaped = escapeRegExp(name);
    // Letter immediately before the anchor → insert a space.
    s = s.replace(new RegExp(`(?<=[A-Za-z])${escaped}\\b`, "gi"), ` ${name}`);
    // Anchor immediately before a lowercase letter → insert a space.
    s = s.replace(new RegExp(`\\b${escaped}(?=[a-z])`, "gi"), `${name} `);
  }
  return s;
}

// Re-case standalone occurrences of known proper nouns to their canonical
// form. Catches "newark Drivers" — only the case is wrong, not the spacing,
// so the anchor pass above won't trigger.
function canonicalizeProperNouns(text: string, names: string[]): string {
  let s = text;
  for (const name of sortByLengthDescending(names)) {
    if (!/[A-Z]/.test(name)) continue; // skip purely-lowercase anchors
    const escaped = escapeRegExp(name);
    s = s.replace(new RegExp(`\\b${escaped}\\b`, "gi"), name);
  }
  return s;
}

// ---------------------------------------------------------------------------
// (4) Generic structural rules
// ---------------------------------------------------------------------------

function addSpacesAtCaseBoundaries(text: string): string {
  // "inClifton" → "in Clifton". Conservative: only [a-z][A-Z]. Acronyms
  // ("BMW") and uppercased trim codes ("HR-V") survive intact.
  return text.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function addSpacesAfterPunctuation(text: string): string {
  // ".Foo" → ". Foo", ",Foo" → ", Foo". Only when next char is a letter,
  // so "$15,000" and ellipses stay intact.
  return text.replace(/([.,;:!?])(?=[A-Za-z])/g, "$1 ");
}

function addSpacesBetweenDigitsAndWords(text: string): string {
  // "21years" → "21 years". Requires ≥3 lowercase letters after the digit
  // so ordinal suffixes ("1st", "2nd", "3rd", "4th") and trim codes
  // ("RAV4", "F-150", "CR-V") stay intact.
  return text.replace(/(\d)([a-z]{3,})/g, "$1 $2");
}

// Drivetrain / trim-line tokens that frequently sit smushed against
// adjacent words ("SEAWD" → "SE AWD", "CVTat" → "CVT at"). Listed
// longest-first so "AWD" doesn't split "AWDX" before "4WD" gets a look.
const TRIM_DRIVETRAIN_TOKENS: ReadonlyArray<string> = [
  "AWD",
  "FWD",
  "RWD",
  "4WD",
  "CVT",
  "SEL",
  "GLC",
  "GLE",
  "GLA",
  "MDX",
  "RDX",
  "HR-V",
  "CR-V",
  "GX",
  "RX",
  "SE",
  "EX",
  "LX",
];

function addSpacesAroundTrimDrivetrainTokens(text: string): string {
  let s = text;
  for (const token of sortByLengthDescending([...TRIM_DRIVETRAIN_TOKENS])) {
    const escaped = escapeRegExp(token);
    // [letter][TOKEN] → insert space before. Token must end at a word
    // boundary so we don't break compounds like "SELFcheck".
    s = s.replace(new RegExp(`(?<=[A-Za-z])(${escaped})\\b`, "g"), " $1");
    // [TOKEN][letter] → insert space after.
    s = s.replace(new RegExp(`\\b(${escaped})(?=[A-Za-z])`, "g"), "$1 ");
  }
  return s;
}

// ---------------------------------------------------------------------------
// (5) Pipeline orchestration
// ---------------------------------------------------------------------------

export function normalizeTextSpacing(text: string, anchors: string[]): string {
  let s = text;
  s = stripStrayMarkup(s);
  s = applyKnownBadMerges(s);
  s = anchorAroundProperNouns(s, anchors);
  s = canonicalizeProperNouns(s, anchors);
  s = addSpacesAtCaseBoundaries(s);
  s = addSpacesAfterPunctuation(s);
  s = addSpacesBetweenDigitsAndWords(s);
  s = addSpacesAroundTrimDrivetrainTokens(s);
  // A second sweep of known merges catches pairs newly exposed by anchor /
  // case-boundary splits (e.g. "Speedway Motorsstocks" → "Motors stocks").
  s = applyKnownBadMerges(s);
  s = s.replace(/\s{2,}/g, " ").trim();
  return s;
}

// ---------------------------------------------------------------------------
// (6) Validation — flag any merged-looking tokens still present
// ---------------------------------------------------------------------------
//
// A token is flagged ONLY if it can be split into two halves where BOTH
// halves are known SEO/dealer markers. This eliminates the previous
// false positives ("Clifton's", "without", "Tradesman", "everything") —
// for each of those, only one half is a marker and the other half is not,
// so they no longer trigger.

const SUSPICIOUS_MERGE_MARKERS: ReadonlySet<string> = new Set([
  // SEO / dealer vocabulary that almost never sits inside a legitimate
  // English compound.
  "used",
  "cars",
  "vehicle",
  "vehicles",
  "inventory",
  "financing",
  "finance",
  "credit",
  "dealer",
  "dealers",
  "dealership",
  "dealerships",
  "makes",
  "models",
  "near",
  "looking",
  "finding",
  "current",
  "trade",
  "apply",
  "browse",
  "visit",
  "roof",
  "path",
  "hybrid",
  "reliable",
  "great",
  "range",
  // Geography / proper nouns relevant to this dealer.
  "clifton",
  "paterson",
  "newark",
  "speedway",
  "motors",
  // Function words frequently found on the right-hand side of a merge.
  "your",
  "ours",
  "their",
  "them",
  "from",
  "with",
  "into",
  "onto",
  "this",
  "that",
  "these",
  "today",
  "tomorrow",
  "whether",
  "while",
  "every",
  "team",
  "terms",
  "loan",
  "bad",
  // Two-letter connector — only flags when paired with a longer marker,
  // so "rangeof" → flagged but "thereof" / "without" stay clean.
  "of",
]);

export function detectSuspiciousMerges(text: string): string[] {
  const tokens = text.match(/[A-Za-z']{7,}/g) ?? [];
  const flagged = new Set<string>();
  for (const token of tokens) {
    const lower = token.toLowerCase();
    if (SUSPICIOUS_MERGE_MARKERS.has(lower)) continue;
    // Try every internal split point. A token is flagged only when BOTH
    // halves are known markers — single-marker matches (e.g. "Clifton's",
    // "Tradesman", "without") are not enough.
    for (let i = 2; i <= lower.length - 2; i++) {
      const left = lower.slice(0, i);
      const right = lower.slice(i);
      if (
        SUSPICIOUS_MERGE_MARKERS.has(left) &&
        SUSPICIOUS_MERGE_MARKERS.has(right)
      ) {
        flagged.add(token);
        break;
      }
    }
  }
  return Array.from(flagged);
}

// ---------------------------------------------------------------------------
// (7) Deterministic HTML builder
//
// The route — not the model — controls every H2 heading, every inline
// link, and every paragraph wrapper, so failures like "can<a" or "</a>any"
// cannot occur regardless of model output. Spaces around the inline links
// are hard-coded into the template.
// ---------------------------------------------------------------------------

export function buildPageContentHtml(
  sections: GeoPageSections,
  ctx: SanitizationContext
): string {
  const { city, state } = ctx;
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

// ---------------------------------------------------------------------------
// (8) Top-level entry point
// ---------------------------------------------------------------------------

export function sanitizeGeneratedGeoPage(
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

  // Detector runs on plain text only so HTML structure doesn't dilute the
  // signal.
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
