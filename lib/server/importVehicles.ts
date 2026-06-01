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

function toRow(v: AutofundsVehicle, slugSet: Set<string>): Record<string, unknown> {
  let slug = generateSlug(v);
  if (slugSet.has(slug)) {
    slug = `${slug}-${(v.stockNumber || v.vin).toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
  }
  slugSet.add(slug);

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

  const slugSet = new Set<string>();
  const rows: Record<string, unknown>[] = [];
  const upsertedVins: string[] = [];

  for (const v of vehicles) {
    if (!v.vin) {
      console.warn(`[importVehicles] skipping row without VIN: ${v.stockNumber || "(no stock)"}`);
      summary.skipped++;
      continue;
    }
    rows.push(toRow(v, slugSet));
    upsertedVins.push(v.vin);
  }

  console.log(`[importVehicles] parsed=${vehicles.length} valid=${rows.length} skipped=${summary.skipped}`);

  if (dryRun) {
    console.log("[importVehicles] dry-run mode — skipping DB writes");
    summary.upserted = rows.length;
    return summary;
  }

  // Pre-fetch existing VINs so we can split inserted vs updated counts after the upsert.
  // Done in chunks to avoid blowing past PostgREST URL length limits on large feeds.
  const existingVins = new Set<string>();
  const VIN_LOOKUP_CHUNK = 200;
  for (let i = 0; i < upsertedVins.length; i += VIN_LOOKUP_CHUNK) {
    const chunk = upsertedVins.slice(i, i + VIN_LOOKUP_CHUNK);
    const vinList = chunk.map((v) => `"${v}"`).join(",");
    const res = await fetch(
      `${url}/rest/v1/inventory?select=vin&vin=in.(${vinList})`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    if (res.ok) {
      const found = (await res.json()) as { vin: string }[];
      for (const r of found) existingVins.add(r.vin);
    } else {
      console.warn(
        `[importVehicles] existing-VIN lookup failed at offset ${i}: ${res.status} — inserted/updated split may be inaccurate`
      );
    }
  }
  console.log(
    `[importVehicles] existing VINs found in DB: ${existingVins.size} / ${upsertedVins.length}`
  );

  const BATCH = 100;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const res = await fetch(`${url}/rest/v1/inventory?on_conflict=vin`, {
      method: "POST",
      headers: hdrs,
      body: JSON.stringify(batch),
    });

    if (!res.ok) {
      const text = await res.text();
      const msg = `Batch upsert error at offset ${i}: ${text}`;
      console.error(`[importVehicles] ${msg}`);
      summary.errors.push(msg);
      continue;
    }

    const upserted = (await res.json()) as { vin?: string }[];
    summary.upserted += upserted.length;

    let batchInserted = 0;
    let batchUpdated = 0;
    for (const row of upserted) {
      if (row.vin && existingVins.has(row.vin)) batchUpdated++;
      else batchInserted++;
    }
    summary.inserted += batchInserted;
    summary.updated += batchUpdated;
    console.log(
      `[importVehicles] batch ${i}–${i + batch.length}: upserted ${upserted.length} (inserted ${batchInserted}, updated ${batchUpdated})`
    );
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
