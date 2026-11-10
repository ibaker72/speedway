import type { DescriptionEnhancer } from "@/lib/descriptions/ai";
import { dealerDescriptionContext } from "@/lib/descriptions/dealer";
import { buildDescriptionFacts } from "@/lib/descriptions/facts";
import { canonicalJson } from "@/lib/descriptions/hash";
import { descriptionTextHash, planDescription, type StoredDescriptionState } from "@/lib/descriptions/plan";
import { TEMPLATE_VERSION } from "@/lib/descriptions/template";
import { specInputFromRow, type StoredSpecRow } from "@/lib/inventory/spec-input";
import { normalizeVehicleSpecs } from "@/lib/inventory/specs";
import { RestError, restHeaders, type RestConfig } from "@/lib/server/inventory-rest";

/**
 * Backfills descriptions and normalized specs for existing inventory rows.
 *
 * - Dry run by default: computes and reports every change, writes nothing.
 * - Idempotent: uses the same planner as the nightly sync, so a row that is
 *   already correct produces no write, and a second run changes nothing.
 * - Resumable: rows are processed in id order and `lastId` is reported after
 *   every page; pass it back as `afterId` to continue after an interruption.
 * - Never overwrites manual descriptions, and never changes price, status,
 *   sold flags, photos, or merchandising flags.
 */

export interface BackfillOptions {
  apply: boolean;
  /** Stop after scanning this many rows. */
  limit?: number;
  afterId?: string | null;
  pageSize?: number;
  includeSold?: boolean;
  enhancer?: DescriptionEnhancer | null;
  onPage?: (progress: BackfillSummary) => void;
}

export interface BackfillChange {
  id: string;
  vin: string | null;
  vehicle: string;
  fields: string[];
  descriptionSource: string;
}

export interface BackfillSummary {
  scanned: number;
  unchanged: number;
  changed: number;
  written: number;
  descriptionsGenerated: number;
  aiEnhanced: number;
  manualPreserved: number;
  specConflicts: number;
  writeConflicts: number;
  lastId: string | null;
  done: boolean;
  changes: BackfillChange[];
  errors: string[];
}

interface BackfillRow extends StoredSpecRow, Partial<StoredDescriptionState> {
  id: string;
  specs?: unknown;
  feed_description?: string | null;
  description_generated_at?: string | null;
}

const SELECT = [
  "id", "vin", "stock_number", "year", "make", "model", "trim", "body_type", "mileage", "exterior_color",
  "interior_color", "transmission", "drivetrain", "engine", "fuel_type", "features", "raw_data", "specs",
  "description", "description_source", "description_hash", "description_input_hash", "description_generator",
  "generated_description", "feed_description", "description_generated_at",
].join(",");

/** Spec and description columns the backfill may write. */
type Patch = Record<string, unknown>;

function same(a: unknown, b: unknown): boolean {
  return canonicalJson(a ?? null) === canonicalJson(b ?? null);
}

export async function backfillDescriptions(config: RestConfig, options: BackfillOptions): Promise<BackfillSummary> {
  const summary: BackfillSummary = {
    scanned: 0,
    unchanged: 0,
    changed: 0,
    written: 0,
    descriptionsGenerated: 0,
    aiEnhanced: 0,
    manualPreserved: 0,
    specConflicts: 0,
    writeConflicts: 0,
    lastId: options.afterId ?? null,
    done: false,
    changes: [],
    errors: [],
  };
  const pageSize = Math.max(1, Math.min(options.pageSize ?? 100, 500));
  const dealer = dealerDescriptionContext();

  for (;;) {
    const remaining = options.limit !== undefined ? options.limit - summary.scanned : Infinity;
    if (remaining <= 0) return summary;
    const params = new URLSearchParams({ select: SELECT, order: "id.asc", limit: String(Math.min(pageSize, remaining)) });
    if (!options.includeSold) params.set("is_sold", "eq.false");
    if (summary.lastId) params.set("id", `gt.${summary.lastId}`);

    const res = await fetch(`${config.url}/rest/v1/inventory?${params.toString()}`, { headers: restHeaders(config) });
    if (!res.ok) {
      const body = await res.text();
      if (res.status === 400) {
        throw new RestError(
          `Inventory columns missing — apply db/migrations/20261109_inventory_descriptions_and_specs.sql first (${body.slice(0, 200)})`,
          res.status,
          body
        );
      }
      throw new RestError(`GET inventory failed: ${res.status}`, res.status, body);
    }
    const rows = (await res.json()) as BackfillRow[];

    for (const row of rows) {
      summary.scanned++;
      summary.lastId = row.id;
      try {
        await processRow(config, row, options, summary, dealer);
      } catch (err) {
        summary.errors.push(`${row.vin ?? row.id}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    options.onPage?.(summary);
    if (rows.length < Math.min(pageSize, remaining)) {
      summary.done = true;
      return summary;
    }
  }
}

async function processRow(
  config: RestConfig,
  row: BackfillRow,
  options: BackfillOptions,
  summary: BackfillSummary,
  dealer: ReturnType<typeof dealerDescriptionContext>
): Promise<void> {
  const specs = normalizeVehicleSpecs(specInputFromRow(row));
  if (specs.conflicts.length) summary.specConflicts++;
  const facts = buildDescriptionFacts(
    { vin: row.vin, year: Number(row.year), make: row.make ?? "", model: row.model ?? "", trim: row.trim, features: row.features },
    specs,
    dealer
  );

  const raw = row.raw_data && typeof row.raw_data === "object" ? (row.raw_data as Record<string, unknown>) : null;
  const legacyFeed = typeof raw?.description === "string" ? raw.description : null;
  const existing: StoredDescriptionState = {
    description: row.description ?? null,
    description_source: row.description_source ?? null,
    description_hash: row.description_hash ?? null,
    description_input_hash: row.description_input_hash ?? null,
    description_generator: row.description_generator ?? null,
    generated_description: row.generated_description ?? null,
    legacy_feed_description: legacyFeed,
  };
  const plan = planDescription({ existing, feedDescription: row.feed_description ?? legacyFeed, facts });

  let generatedAt = row.description_generated_at ?? null;
  if (plan.regenerated) {
    summary.descriptionsGenerated++;
    generatedAt = new Date().toISOString();
  }
  if (plan.description_source === "manual") summary.manualPreserved++;

  // Optional AI rewrite of template text (cached by facts hash afterwards).
  if (options.enhancer && plan.description_source === "generated" && plan.description_generator === TEMPLATE_VERSION) {
    const rewritten = await options.enhancer.enhance(facts, plan.description);
    if (rewritten) {
      summary.aiEnhanced++;
      plan.description = rewritten;
      plan.generated_description = rewritten;
      plan.description_hash = descriptionTextHash(rewritten);
      plan.description_generator = options.enhancer.generator;
      generatedAt = new Date().toISOString();
    }
  }

  const desired: Patch = {
    specs,
    body_type: specs.bodyType,
    drivetrain: specs.drivetrain,
    transmission: specs.transmission?.type ?? null,
    fuel_type: specs.fuel?.type ?? null,
    engine: specs.engine?.label ?? null,
    exterior_color: specs.exteriorColor,
    interior_color: specs.interiorColor,
    description: plan.description,
    description_source: plan.description_source,
    description_hash: plan.description_hash,
    feed_description: plan.feed_description,
    generated_description: plan.generated_description,
    description_input_hash: plan.description_input_hash,
    description_generator: plan.description_generator,
    description_generated_at: generatedAt,
  };
  const current = row as unknown as Record<string, unknown>;
  const patch: Patch = {};
  for (const [key, value] of Object.entries(desired)) {
    if (key === "description_generated_at") continue;
    if (!same(current[key], value)) patch[key] = value;
  }
  if (Object.keys(patch).length === 0) {
    summary.unchanged++;
    return;
  }
  if (!same(current.description_generated_at, generatedAt)) patch.description_generated_at = generatedAt;

  summary.changed++;
  summary.changes.push({
    id: row.id,
    vin: row.vin ?? null,
    vehicle: [row.year, row.make, row.model, row.trim].filter(Boolean).join(" "),
    fields: Object.keys(patch).sort(),
    descriptionSource: plan.description_source,
  });
  if (!options.apply) return;

  // Don't race a person typing a description right now: when filling an empty
  // description, only write if it is still empty. (Replacing non-empty text
  // only happens for unusable feed notes like "CASH DEAL ONLY", which stay
  // in feed_description.)
  const guard = new URLSearchParams({ id: `eq.${row.id}`, select: "id" });
  if ("description" in patch && !row.description) guard.set("description", "is.null");

  const res = await fetch(`${config.url}/rest/v1/inventory?${guard.toString()}`, {
    method: "PATCH",
    headers: restHeaders(config, "return=representation"),
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`PATCH failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
  const updated = (await res.json()) as unknown[];
  if (updated.length === 0) summary.writeConflicts++;
  else summary.written++;
}
