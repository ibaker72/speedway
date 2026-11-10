import { assessDealerDescription, cleanDescriptionText } from "@/lib/descriptions/assess";
import type { DescriptionFacts } from "@/lib/descriptions/facts";
import { contentHash } from "@/lib/descriptions/hash";
import { TEMPLATE_VERSION, generateTemplateDescription } from "@/lib/descriptions/template";

/**
 * Description provenance — which text a vehicle publishes, and why.
 *
 * Priority:
 *   1. manual    — written by staff in Supabase. Never overwritten.
 *   2. feed      — the Autofunds "Comments" cell, when it reads as a real
 *                  description (see assess.ts).
 *   3. generated — built from verified facts (template, or a cached AI rewrite
 *                  produced offline by the backfill script).
 *
 * Manual edits are detected without any UI: whenever the system publishes
 * text it stores `description_hash`. If the `description` column later no
 * longer matches that hash, a person changed it, and the row is locked to
 * `manual`. Staff can also lock a row explicitly by setting
 * `description_source = 'manual'`.
 *
 * Regeneration happens only when the facts hash changes (or the template
 * version changes), so a nightly sync with unchanged data writes nothing.
 */

export type DescriptionSource = "manual" | "feed" | "generated";

/** Bump when DescriptionFacts' meaning changes so every input hash changes. */
const FACTS_VERSION = "facts-v1";

export interface StoredDescriptionState {
  description: string | null;
  description_source: string | null;
  description_hash: string | null;
  description_input_hash: string | null;
  description_generator: string | null;
  generated_description: string | null;
  /**
   * For rows imported before provenance tracking existed: the feed comments
   * the old importer copied into `description` (raw_data->>description).
   */
  legacy_feed_description?: string | null;
}

export interface DescriptionPlan {
  description: string;
  description_source: DescriptionSource;
  description_hash: string;
  feed_description: string | null;
  generated_description: string | null;
  description_input_hash: string | null;
  description_generator: string | null;
  /** True when generated_description was (re)built in this plan. */
  regenerated: boolean;
  /** True when this plan newly detected a manual edit. */
  manualDetected: boolean;
}

export function descriptionInputHash(facts: DescriptionFacts): string {
  return contentHash({ v: FACTS_VERSION, facts });
}

export function descriptionTextHash(text: string): string {
  return contentHash(`description:${text}`);
}

/** Is the published description a person's edit that must be preserved? */
export function isManualDescription(existing: StoredDescriptionState | null, incomingFeed: string | null): boolean {
  if (!existing) return false;
  const current = cleanDescriptionText(existing.description);
  if (!current) return false;
  if (existing.description_source === "manual") return true;
  if (existing.description_hash) return descriptionTextHash(current) !== existing.description_hash;
  // Legacy row (no hash yet): the old importer always copied the feed
  // comments verbatim, so anything else was typed by a person.
  const legacy = cleanDescriptionText(existing.legacy_feed_description);
  const incoming = cleanDescriptionText(incomingFeed);
  return current !== legacy && current !== incoming;
}

export function planDescription(input: {
  existing: StoredDescriptionState | null;
  /** Latest dealer comments from the feed (or the stored copy, in the backfill). */
  feedDescription: string | null;
  facts: DescriptionFacts;
}): DescriptionPlan {
  const { existing, facts } = input;
  const feed = cleanDescriptionText(input.feedDescription) || null;
  const keepGenerated = {
    generated_description: existing?.generated_description ?? null,
    description_input_hash: existing?.description_input_hash ?? null,
    description_generator: existing?.description_generator ?? null,
  };

  if (isManualDescription(existing, feed)) {
    const text = cleanDescriptionText(existing!.description);
    return {
      description: text,
      description_source: "manual",
      description_hash: descriptionTextHash(text),
      feed_description: feed,
      ...keepGenerated,
      regenerated: false,
      manualDetected: existing!.description_source !== "manual",
    };
  }

  const verdict = assessDealerDescription(feed, { vin: facts.vin });
  if (verdict.usable) {
    return {
      description: verdict.text,
      description_source: "feed",
      description_hash: descriptionTextHash(verdict.text),
      feed_description: feed,
      ...keepGenerated,
      regenerated: false,
      manualDetected: false,
    };
  }

  const inputHash = descriptionInputHash(facts);
  const generator = existing?.description_generator ?? null;
  // Cached text is reused while the facts are unchanged: a template from the
  // current version, or an AI rewrite (which is only ever produced offline).
  const cacheValid =
    Boolean(existing?.generated_description) &&
    existing?.description_input_hash === inputHash &&
    (generator === TEMPLATE_VERSION || Boolean(generator?.startsWith("ai:")));

  const generated = cacheValid ? existing!.generated_description! : generateTemplateDescription(facts);
  return {
    description: generated,
    description_source: "generated",
    description_hash: descriptionTextHash(generated),
    feed_description: feed,
    generated_description: generated,
    description_input_hash: inputHash,
    description_generator: cacheValid ? generator : TEMPLATE_VERSION,
    regenerated: !cacheValid,
    manualDetected: false,
  };
}
