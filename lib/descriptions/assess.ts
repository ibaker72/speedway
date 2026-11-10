/**
 * Decides whether a dealership-written description (the Autofunds "Comments"
 * cell, or text typed by staff) can stand on its own as the vehicle overview.
 *
 * Unusable text is never discarded: short notes such as "CASH DEAL ONLY !."
 * are still shown on the page as a dealer note, and the original stays in
 * `feed_description`.
 */

export type DescriptionVerdict =
  | { usable: true; text: string }
  | { usable: false; reason: "empty" | "placeholder" | "too-short" | "mentions-other-vin"; text: string };

const PLACEHOLDER =
  /^(n\/?a|na|none|tbd|test|\.+|-+|call( us)?( for (details|info|more information|price))?|coming soon|description coming soon|no description( available)?|see dealer( for details)?)[.!\s]*$/i;

const MIN_WORDS = 20;
const MIN_CHARS = 120;

/** Normalizes line endings and trims each line, keeping paragraph breaks. */
export function cleanDescriptionText(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function assessDealerDescription(raw: unknown, context: { vin?: string | null } = {}): DescriptionVerdict {
  const text = cleanDescriptionText(raw);
  const flat = text.replace(/\s+/g, " ");
  if (!flat) return { usable: false, reason: "empty", text };
  if (PLACEHOLDER.test(flat)) return { usable: false, reason: "placeholder", text };

  const words = flat.split(" ").filter((w) => /[a-z0-9]/i.test(w)).length;
  if (words < MIN_WORDS || flat.length < MIN_CHARS) return { usable: false, reason: "too-short", text };

  // A description copied from another listing names that listing's VIN.
  const vin = context.vin?.toUpperCase();
  if (vin) {
    const mentioned = flat.toUpperCase().match(/\b[A-HJ-NPR-Z0-9]{17}\b/g) ?? [];
    if (mentioned.some((candidate) => /\d.*\d/.test(candidate) && candidate !== vin)) {
      return { usable: false, reason: "mentions-other-vin", text };
    }
  }
  return { usable: true, text };
}

/**
 * Splits stored text into display paragraphs. Autofunds flattens line breaks
 * to runs of spaces, so when no newlines are present, two or more spaces
 * before a capital letter, quote, or bullet are treated as a break.
 */
export function descriptionParagraphs(text: string | null | undefined): string[] {
  const cleaned = cleanDescriptionText(text ?? "");
  if (!cleaned) return [];
  const parts = cleaned.includes("\n")
    ? cleaned.split(/\n\s*\n|\n/)
    : cleaned.split(/\s{2,}(?=[A-Z"“(•*\-–])/);
  return parts.map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean);
}

/**
 * Short dealer comments that aren't a full description ("CASH DEAL ONLY !.")
 * are still shown, as a note, when the overview comes from somewhere else.
 */
export function dealerNoteFrom(
  feedDescription: string | null | undefined,
  source: "manual" | "feed" | "generated" | null | undefined,
  vin?: string | null
): string | null {
  if (source === "feed") return null;
  const verdict = assessDealerDescription(feedDescription, { vin });
  return !verdict.usable && verdict.reason === "too-short" ? verdict.text : null;
}
