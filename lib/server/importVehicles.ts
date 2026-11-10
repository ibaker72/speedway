import { revalidatePath } from "next/cache";
import { buildDescriptionFacts } from "@/lib/descriptions/facts";
import { dealerDescriptionContext } from "@/lib/descriptions/dealer";
import { contentHash } from "@/lib/descriptions/hash";
import { planDescription, type StoredDescriptionState } from "@/lib/descriptions/plan";
import type { AutofundsVehicle } from "@/lib/feed/autofunds-parser";
import { specInputFromFeed } from "@/lib/inventory/spec-input";
import { cleanSpecText, normalizeVehicleSpecs, type VehicleSpecs } from "@/lib/inventory/specs";
import {
  RestError,
  chunk,
  fetchAllRows,
  inList,
  inventoryRestConfig,
  restHeaders,
  type RestConfig,
} from "@/lib/server/inventory-rest";

const SOURCE = "autofunds";

export interface ImportSummary {
  totalRows: number;
  upserted: number;
  inserted: number;
  updated: number;
  /** Rows already identical to the feed — not written at all. */
  unchanged: number;
  skipped: number;
  markedInactive: number;
  descriptionsGenerated: number;
  manualDescriptionsPreserved: number;
  vehiclesWithSpecConflicts: number;
  /** "legacy" when the 20261109 migration hasn't been applied yet. */
  schemaMode: "full" | "legacy";
  inactivationSkipped?: string;
  errors: string[];
}

function generateSlug(v: AutofundsVehicle): string {
  return [v.year, v.make, v.model, v.trim]
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+$/, "");
}

/**
 * Picks the slug to upsert for a vehicle.
 *
 * The inventory table has a UNIQUE index on slug while the upsert conflicts
 * on VIN, so a slug that collides with ANY existing row (including sold /
 * inactive rows that are no longer in the feed) makes the whole upsert
 * batch fail. That exact scenario took the daily sync down: the feed's
 * remaining "2018 Toyota RAV4 XLE AWD (Natl)" regenerated the base slug
 * already owned by a sold sibling row, and every sync from then on wrote
 * nothing while image URLs in the DB went stale.
 *
 * Rules:
 *  - A VIN that already exists keeps its current slug (stable URLs, no
 *    conflict possible).
 *  - A new VIN whose generated slug is taken (by the DB or by another row
 *    in this feed) gets a stock/VIN suffix, then a VIN suffix as a last
 *    resort.
 */
export function resolveSlug(
  v: AutofundsVehicle,
  vinToSlug: ReadonlyMap<string, string>,
  takenSlugs: Set<string>
): string {
  const existing = vinToSlug.get(v.vin);
  if (existing) {
    takenSlugs.add(existing);
    return existing;
  }

  let slug = generateSlug(v);
  if (takenSlugs.has(slug)) {
    const suffix = (v.stockNumber || v.vin).toLowerCase().replace(/[^a-z0-9]/g, "-");
    slug = `${slug}-${suffix}`;
  }
  if (takenSlugs.has(slug)) {
    slug = `${slug}-${v.vin.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
  }
  takenSlugs.add(slug);
  return slug;
}

interface ExistingRow extends Partial<StoredDescriptionState> {
  id: string;
  vin: string | null;
  slug: string | null;
  source?: string | null;
  is_sold?: boolean | null;
  sync_hash?: string | null;
  description_generated_at?: string | null;
}

const LEGACY_SELECT = "id,vin,slug,source,is_sold";
const FULL_SELECT = [
  LEGACY_SELECT,
  "sync_hash",
  "description",
  "description_source",
  "description_hash",
  "description_input_hash",
  "description_generator",
  "generated_description",
  "description_generated_at",
  "legacy_feed_description:raw_data->>description",
].join(",");

/**
 * Loads every inventory row (sold rows included — their slugs are taken).
 * Falls back to the pre-migration column set when the new columns don't
 * exist yet, so deploying the code before the migration can't break the
 * nightly sync.
 */
async function loadExisting(config: RestConfig): Promise<{ rows: ExistingRow[]; mode: "full" | "legacy" }> {
  try {
    const rows = await fetchAllRows<ExistingRow>(config, "inventory", new URLSearchParams({ select: FULL_SELECT }));
    return { rows, mode: "full" };
  } catch (err) {
    if (!(err instanceof RestError) || err.status !== 400) throw err;
    console.warn(
      "[importVehicles] description/spec columns not found — run db/migrations/20261109_inventory_descriptions_and_specs.sql. Using legacy write mode."
    );
    const rows = await fetchAllRows<ExistingRow>(config, "inventory", new URLSearchParams({ select: LEGACY_SELECT }));
    return { rows, mode: "legacy" };
  }
}

interface PlannedRow {
  vin: string;
  isNew: boolean;
  changed: boolean;
  /** Columns written on insert and update. */
  content: Record<string, unknown>;
}

/** Columns derived from the feed (no timestamps), shared by both schema modes. */
function baseColumns(v: AutofundsVehicle, slug: string, specs: VehicleSpecs): Record<string, unknown> {
  return {
    slug,
    source: SOURCE,
    status: "active",
    is_sold: false,
    stock_number: v.stockNumber,
    vin: v.vin,
    year: v.year,
    make: cleanSpecText(v.make),
    model: cleanSpecText(v.model),
    trim: cleanSpecText(v.trim) || null,
    // Unknown specs are stored as NULL — never a guessed default.
    body_type: specs.bodyType,
    condition: v.condition,
    price: v.price,
    msrp: null,
    internet_price: v.internetPrice ?? null,
    mileage: v.mileage,
    exterior_color: specs.exteriorColor,
    interior_color: specs.interiorColor,
    transmission: specs.transmission?.type ?? null,
    drivetrain: specs.drivetrain,
    engine: specs.engine?.label ?? null,
    fuel_type: specs.fuel?.type ?? null,
    images: v.images,
    thumbnail_url: v.images[0]?.url ?? null,
    features: v.features,
    estimated_payment: v.estimatedPayment ?? null,
  };
}

function safeRevalidate(): void {
  try {
    revalidatePath("/inventory", "page");
    revalidatePath("/inventory/[slug]", "page");
    revalidatePath("/", "page");
    revalidatePath("/locations/[city]", "page");
  } catch (err) {
    // Scripts run outside Next.js have no revalidation context.
    console.warn(`[importVehicles] revalidation skipped: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * Upserts the Autofunds feed into `inventory`.
 *
 * Idempotent: a row whose content hash (`sync_hash`) is unchanged is not
 * written at all, so `last_seen_at` is the last sync that wrote the row
 * (feed membership is tracked by `is_sold`/`status`, not by this column). `date_added` and
 * the merchandising flags (is_featured, is_new_arrival, is_commercial) are
 * set on insert only, so staff curation and "newest" sorting survive syncs.
 */
export async function importVehicles(vehicles: AutofundsVehicle[], dryRun = false): Promise<ImportSummary> {
  const summary: ImportSummary = {
    totalRows: vehicles.length,
    upserted: 0,
    inserted: 0,
    updated: 0,
    unchanged: 0,
    skipped: 0,
    markedInactive: 0,
    descriptionsGenerated: 0,
    manualDescriptionsPreserved: 0,
    vehiclesWithSpecConflicts: 0,
    schemaMode: "full",
    errors: [],
  };

  // A dry run parses and plans without touching (or needing) the database.
  const config = dryRun ? null : inventoryRestConfig();
  const { rows: existingRows, mode } = config
    ? await loadExisting(config)
    : { rows: [] as ExistingRow[], mode: "full" as const };
  summary.schemaMode = mode;

  const byVin = new Map<string, ExistingRow>();
  const vinToSlug = new Map<string, string>();
  const takenSlugs = new Set<string>();
  for (const row of existingRows) {
    if (row.slug) takenSlugs.add(row.slug);
    if (row.vin) {
      byVin.set(row.vin, row);
      if (row.slug) vinToSlug.set(row.vin, row.slug);
    }
  }
  console.log(`[importVehicles] loaded ${byVin.size} existing VINs / ${takenSlugs.size} slugs (schema: ${mode})`);

  const dealer = dealerDescriptionContext();
  const planned: PlannedRow[] = [];
  const feedVins = new Set<string>();

  for (const v of vehicles) {
    if (!v.vin) {
      console.warn(`[importVehicles] skipping row without VIN: ${v.stockNumber || "(no stock)"}`);
      summary.skipped++;
      continue;
    }
    if (feedVins.has(v.vin)) {
      summary.skipped++;
      summary.errors.push(`Duplicate VIN in feed: ${v.vin}`);
      continue;
    }
    feedVins.add(v.vin);

    const existing = byVin.get(v.vin) ?? null;
    const slug = resolveSlug(v, vinToSlug, takenSlugs);
    const specs = normalizeVehicleSpecs(specInputFromFeed(v));
    if (specs.conflicts.length) summary.vehiclesWithSpecConflicts++;
    const content = baseColumns(v, slug, specs);

    if (mode === "full") {
      const facts = buildDescriptionFacts(
        { vin: v.vin, year: v.year, make: v.make, model: v.model, trim: v.trim, features: v.features },
        specs,
        dealer
      );
      const plan = planDescription({ existing: existing as StoredDescriptionState | null, feedDescription: v.description ?? null, facts });
      if (plan.description_source === "manual") summary.manualDescriptionsPreserved++;
      if (plan.regenerated) summary.descriptionsGenerated++;
      Object.assign(content, {
        specs,
        description: plan.description,
        description_source: plan.description_source,
        description_hash: plan.description_hash,
        feed_description: plan.feed_description,
        generated_description: plan.generated_description,
        description_input_hash: plan.description_input_hash,
        description_generator: plan.description_generator,
      });
      // The hash covers everything the sync owns except timestamps and raw_data.
      const syncHash = contentHash(content);
      const changed = !existing || Boolean(existing.is_sold) || existing.sync_hash !== syncHash;
      Object.assign(content, {
        sync_hash: syncHash,
        description_generated_at: plan.regenerated ? new Date().toISOString() : existing?.description_generated_at ?? null,
        raw_data: v,
      });
      planned.push({ vin: v.vin, isNew: !existing, changed, content });
    } else {
      // Legacy schema: same behavior as before this release for descriptions
      // (feed comments, verbatim) — but with corrected specs and without
      // resetting date_added.
      Object.assign(content, { description: v.description ?? null, raw_data: v });
      planned.push({ vin: v.vin, isNew: !existing, changed: true, content });
    }
  }

  const changedRows = planned.filter((p) => p.changed);
  summary.unchanged = planned.length - changedRows.length;
  console.log(
    `[importVehicles] parsed=${vehicles.length} planned=${planned.length} changed=${changedRows.length} unchanged=${summary.unchanged} skipped=${summary.skipped}`
  );

  if (!config) {
    console.log("[importVehicles] dry-run mode — skipping DB writes");
    summary.upserted = changedRows.length;
    return summary;
  }

  const now = new Date().toISOString();
  const insertRows: Record<string, unknown>[] = changedRows
    .filter((p) => p.isNew)
    .map((p) => ({
      ...p.content,
      last_seen_at: now,
      date_modified: now,
      date_added: now,
      is_commercial: false,
      is_featured: false,
      is_new_arrival: false,
    }));
  const updateRows: Record<string, unknown>[] = changedRows.filter((p) => !p.isNew).map((p) => ({ ...p.content, last_seen_at: now, date_modified: now }));

  const upsert = async (batch: Record<string, unknown>[]): Promise<boolean> => {
    const res = await fetch(`${config.url}/rest/v1/inventory?on_conflict=vin`, {
      method: "POST",
      headers: restHeaders(config, "return=minimal,resolution=merge-duplicates"),
      body: JSON.stringify(batch),
    });
    if (!res.ok) {
      console.error(`[importVehicles] upsert error: ${res.status} ${await res.text()}`);
      return false;
    }
    return true;
  };

  // PostgREST bulk writes need identical keys per batch, so inserts (which
  // carry date_added and default flags) and updates are sent separately.
  for (const [rows, kind] of [
    [insertRows, "inserted"],
    [updateRows, "updated"],
  ] as const) {
    for (const batch of chunk(rows, 100)) {
      if (await upsert(batch)) {
        summary[kind] += batch.length;
        continue;
      }
      // A single bad row (e.g. a unique-constraint conflict) must not sink
      // the whole batch — retry rows one at a time and skip only the bad ones.
      console.warn(`[importVehicles] batch upsert failed — retrying ${batch.length} rows individually`);
      for (const row of batch) {
        if (await upsert([row])) {
          summary[kind]++;
        } else {
          summary.errors.push(`Row upsert failed for VIN ${String(row.vin)}`);
          summary.skipped++;
        }
      }
    }
  }
  summary.upserted = summary.inserted + summary.updated;

  // Unchanged rows get no write at all. (The production inventory trigger
  // stamps date_modified/updated_at on every UPDATE, so even a last_seen_at
  // touch would make every vehicle look modified daily in the sitemap.)

  // Vehicles from this source that are no longer in the feed → inactive.
  const active = existingRows.filter((r) => r.vin && (r.source ?? SOURCE) === SOURCE && !r.is_sold);
  const missing = active.map((r) => r.vin as string).filter((vin) => !feedVins.has(vin));
  const limit = Math.max(10, Math.floor(active.length * 0.5));
  if (missing.length > limit && process.env.SYNC_ALLOW_MASS_INACTIVATION !== "true") {
    // A truncated or partial CSV must not mark most of the lot as sold.
    summary.inactivationSkipped = `${missing.length} of ${active.length} active vehicles are missing from the feed (limit ${limit}); set SYNC_ALLOW_MASS_INACTIVATION=true to allow.`;
    summary.errors.push(`Inactivation skipped: ${summary.inactivationSkipped}`);
    console.error(`[importVehicles] ${summary.inactivationSkipped}`);
  } else {
    for (const vins of chunk(missing, 100)) {
      const res = await fetch(
        `${config.url}/rest/v1/inventory?source=eq.${SOURCE}&is_sold=eq.false&vin=in.${encodeURIComponent(inList(vins))}`,
        {
          method: "PATCH",
          headers: restHeaders(config, "return=representation"),
          body: JSON.stringify({ is_sold: true, status: "inactive", date_modified: now }),
        }
      );
      if (res.ok) {
        summary.markedInactive += ((await res.json()) as unknown[]).length;
      } else {
        summary.errors.push(`Inactivation failed: ${res.status}`);
        console.error(`[importVehicles] inactivate error: ${await res.text()}`);
      }
    }
    if (summary.markedInactive) console.log(`[importVehicles] marked ${summary.markedInactive} vehicles inactive`);
  }

  if (summary.upserted > 0 || summary.markedInactive > 0) safeRevalidate();
  return summary;
}
