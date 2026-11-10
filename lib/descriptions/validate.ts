import type { DescriptionFacts } from "@/lib/descriptions/facts";

/**
 * Guardrails for any generated description (template or AI rewrite).
 * A description fails if it makes a claim the facts can't support.
 */

const BANNED_CLAIMS: { pattern: RegExp; reason: string }[] = [
  { pattern: /\baccident|collision|damage[- ]free\b/i, reason: "accident history" },
  { pattern: /\b(carfax|autocheck)\b|\bclean (title|history|record|report)\b/i, reason: "vehicle history" },
  { pattern: /\b(one|single|1|first|two|2)[- ]owners?\b|\bowners?\b/i, reason: "ownership history" },
  { pattern: /\bwarrant(y|ies|ied)\b|\bcertified\b|\bcpo\b/i, reason: "warranty or certification" },
  { pattern: /\binspect(ed|ion)\b|\bguarantee/i, reason: "inspection or guarantee" },
  { pattern: /\b(pre-?)?approv(al|ed|e)\b|\bany credit\b|\ball credit\b|\bbad credit\b/i, reason: "financing approval" },
  { pattern: /\b(excellent|perfect|great|mint|pristine|immaculate|flawless|good) (shape|condition)\b|\blike[- ]new\b|\bwell[- ]maintained\b|\bmaintained\b/i, reason: "condition" },
  { pattern: /\bservice (history|records)\b|\bruns (great|strong|perfect|well)\b|\bno (issues|problems)\b|\bneeds nothing\b/i, reason: "service history or condition" },
  { pattern: /\b(best|unbeatable|amazing|incredible|must[- ]see|won'?t last|steal|deal of)\b/i, reason: "hype" },
  { pattern: /\$|\bprice[ds]?\b|\bmsrp\b/i, reason: "price" },
  { pattern: /https?:\/\/|www\.|@[a-z0-9-]+\.[a-z]/i, reason: "link or email" },
  { pattern: /\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/, reason: "phone number" },
  { pattern: /[#*_`]|^\s*[-•]\s/m, reason: "markdown or list formatting" },
];

export interface DescriptionValidation {
  ok: boolean;
  problems: string[];
}

function numbersIn(text: string): string[] {
  return (text.match(/\d+(?:[.,]\d+)*/g) ?? []).map((n) => n.replace(/,/g, ""));
}

/**
 * @param allowedText text whose numbers may appear in the output (the
 *   template draft for an AI rewrite); the facts' numbers are always allowed.
 */
export function validateGeneratedDescription(text: string, facts: DescriptionFacts, allowedText = ""): DescriptionValidation {
  const problems: string[] = [];
  const trimmed = text.trim();
  if (trimmed.length < 120) problems.push("too short");
  if (trimmed.length > 1600) problems.push("too long");

  for (const { pattern, reason } of BANNED_CLAIMS) {
    if (pattern.test(trimmed)) problems.push(reason);
  }

  const lower = trimmed.toLowerCase();
  if (!lower.includes(String(facts.year)) || !lower.includes(facts.make.toLowerCase()) || !lower.includes(facts.model.toLowerCase())) {
    problems.push("missing year, make, or model");
  }

  // Every number must come from the facts (mileage, engine size, year…).
  const allowed = new Set([...numbersIn(JSON.stringify(facts)), ...numbersIn(allowedText)]);
  if (facts.mileage) allowed.add(String(facts.mileage));
  if (facts.fuel?.type === "Flex Fuel") allowed.add("85"); // "E85"
  const unknown = numbersIn(trimmed).filter((n) => !allowed.has(n));
  if (unknown.length) problems.push(`unsupported numbers: ${[...new Set(unknown)].join(", ")}`);

  // Keyword stuffing: the full make + model should not be repeated.
  const fullName = `${facts.make} ${facts.model}`.toLowerCase();
  if (lower.split(fullName).length - 1 > 2) problems.push("repeats the make and model");

  return { ok: problems.length === 0, problems };
}
