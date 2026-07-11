import { revalidatePath } from "next/cache";
import type { AutofundsVehicle } from "@/lib/feed/autofunds-parser";

const SOURCE = "autofunds";

interface ImportSummary {
  totalRows: number;
  upserted: number;
  inserted: number;
  updated: number;
  skipped: number;
  markedInactive: number;
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

function toRow(v: AutofundsVehicle, slug: string): Record<string, unknown> {
  const now = new Date().toISOString();
  return {
    slug,
    source: SOURCE,
    status: "active",
    last_seen_at: now,
    stock_number: v.stockNumber,
    vin: v.vin,
    year: v.year,
    make: v.make,
    model: v.model,
    trim: v.trim ?? null,
    body_type: v.bodyType ?? "sedan",
    condition: v.condition,
    price: v.price,
    msrp: null,
    internet_price: v.internetPrice ?? null,
    mileage: v.mileage,
    exterior_color: v.exteriorColor ?? "",
    interior_color: v.interiorColor ?? "",
    transmission: v.transmission ?? "Automatic",
    drivetrain: v.drivetrain ?? "FWD",
    engine: v.engine ?? "",
    fuel_type: v.fuelType ?? "Gasoline",
    images: v.images,
    thumbnail_url: v.images[0]?.url ?? null,
    description: v.description ?? null,
    features: v.features,
    is_commercial: false,
    is_featured: false,
    is_new_arrival: false,
    is_sold: false,
    date_added: now,
    date_modified: now,
    estimated_payment: v.estimatedPayment ?? null,
    raw_data: v,
  };
}

/**
 * Fetches (vin, slug) for every inventory row so slugs can be kept stable
 * for known VINs and deduplicated against the whole table (sold rows
 * included) for new VINs.
 */
async function fetchExistingVinSlugs(
  url: string,
  key: string
): Promise<{ vinToSlug: Map<string, string>; allSlugs: Set<string> } | null> {
  const vinToSlug = new Map<string, string>();
  const allSlugs = new Set<string>();
  const PAGE = 1000;
  for (let offset = 0; ; offset += PAGE) {
    const res = await fetch(
      `${url}/rest/v1/inventory?select=vin,slug&limit=${PAGE}&offset=${offset}`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    if (!res.ok) {
      console.error(
        `[importVehicles] existing vin/slug lookup failed: ${res.status} ${await res.text()}`
      );
      return null;
    }
    const rows = (await res.json()) as { vin: string | null; slug: string | null }[];
    for (const r of rows) {
      if (r.slug) allSlugs.add(r.slug);
      if (r.vin && r.slug) vinToSlug.set(r.vin, r.slug);
    }
    if (rows.length < PAGE) break;
  }
  return { vinToSlug, allSlugs };
}

export async function importVehicles(
  vehicles: AutofundsVehicle[],
  dryRun = false
): Promise<ImportSummary> {
  const summary: ImportSummary = {
    totalRows: vehicles.length,
    upserted: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    markedInactive: 0,
    errors: [],
  };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase environment variables are not configured");
  }

  const hdrs = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "return=representation,resolution=merge-duplicates",
  };

  // Existing vin→slug mapping drives both slug stability and the
  // inserted/updated split. If the lookup fails we still import (per-row
  // fallback below limits the blast radius of any slug conflict).
  let vinToSlug = new Map<string, string>();
  let takenSlugs = new Set<string>();
  if (!dryRun) {
    const existing = await fetchExistingVinSlugs(url, key);
    if (existing) {
      vinToSlug = existing.vinToSlug;
      takenSlugs = existing.allSlugs;
      console.log(
        `[importVehicles] loaded ${vinToSlug.size} existing VINs / ${takenSlugs.size} slugs from DB`
      );
    } else {
      console.warn(
        "[importVehicles] proceeding without existing slug data — slug conflicts will fall back to per-row upserts"
      );
    }
  }

  const rows: Record<string, unknown>[] = [];
  const upsertedVins: string[] = [];

  for (const v of vehicles) {
    if (!v.vin) {
      console.warn(`[importVehicles] skipping row without VIN: ${v.stockNumber || "(no stock)"}`);
      summary.skipped++;
      continue;
    }
    rows.push(toRow(v, resolveSlug(v, vinToSlug, takenSlugs)));
    upsertedVins.push(v.vin);
  }

  console.log(`[importVehicles] parsed=${vehicles.length} valid=${rows.length} skipped=${summary.skipped}`);

  if (dryRun) {
    console.log("[importVehicles] dry-run mode — skipping DB writes");
    summary.upserted = rows.length;
    return summary;
  }

  const existingVins = new Set(
    upsertedVins.filter((vin) => vinToSlug.has(vin))
  );
  console.log(
    `[importVehicles] existing VINs found in DB: ${existingVins.size} / ${upsertedVins.length}`
  );

  const upsertBatch = async (batch: Record<string, unknown>[]): Promise<{ vin?: string }[] | null> => {
    const res = await fetch(`${url}/rest/v1/inventory?on_conflict=vin`, {
      method: "POST",
      headers: hdrs,
      body: JSON.stringify(batch),
    });
    if (!res.ok) {
      console.error(`[importVehicles] upsert error: ${res.status} ${await res.text()}`);
      return null;
    }
    return (await res.json()) as { vin?: string }[];
  };

  const recordUpserted = (upserted: { vin?: string }[]) => {
    summary.upserted += upserted.length;
    for (const row of upserted) {
      if (row.vin && existingVins.has(row.vin)) summary.updated++;
      else summary.inserted++;
    }
  };

  const BATCH = 100;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const upserted = await upsertBatch(batch);

    if (upserted) {
      recordUpserted(upserted);
      console.log(
        `[importVehicles] batch ${i}–${i + batch.length}: upserted ${upserted.length}`
      );
      continue;
    }

    // A single bad row (e.g. a unique-constraint conflict) must not sink
    // the whole batch — retry rows one at a time and skip only the bad ones.
    console.warn(
      `[importVehicles] batch upsert failed at offset ${i} — retrying rows individually`
    );
    for (const row of batch) {
      const single = await upsertBatch([row]);
      if (single) {
        recordUpserted(single);
      } else {
        const msg = `Row upsert failed for VIN ${String(row.vin)}`;
        console.error(`[importVehicles] ${msg}`);
        summary.errors.push(msg);
        summary.skipped++;
      }
    }
  }

  // Mark vehicles from this source that weren't in the payload as inactive
  if (upsertedVins.length > 0) {
    const vinList = upsertedVins.map((v) => `"${v}"`).join(",");
    const inactivateRes = await fetch(
      `${url}/rest/v1/inventory?source=eq.${SOURCE}&is_sold=eq.false&vin=not.in.(${vinList})`,
      {
        method: "PATCH",
        headers: { ...hdrs, Prefer: "return=representation" },
        body: JSON.stringify({
          is_sold: true,
          status: "inactive",
          date_modified: new Date().toISOString(),
        }),
      }
    );

    if (inactivateRes.ok) {
      const inactivated = (await inactivateRes.json()) as unknown[];
      summary.markedInactive = inactivated.length;
      console.log(`[importVehicles] marked ${inactivated.length} vehicles inactive`);
    } else {
      const text = await inactivateRes.text();
      console.error(`[importVehicles] inactivate error: ${text}`);
    }
  }

  revalidatePath("/inventory", "page");
  revalidatePath("/inventory/[slug]", "page");
  revalidatePath("/", "page");

  return summary;
}
