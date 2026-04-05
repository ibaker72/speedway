import { NextResponse } from "next/server";

const REQUIRED_FIELDS = ["vin", "year", "make", "model", "price"] as const;

function generateSlug(v: Record<string, unknown>): string {
  return [v.year, v.make, v.model, v.trim]
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+$/, "");
}

function parseImages(raw: unknown): Array<{ url: string; alt: string; isPrimary: boolean }> {
  if (typeof raw === "string") {
    return raw
      .split("|")
      .map((u) => u.trim())
      .filter(Boolean)
      .map((url, i) => ({ url, alt: "", isPrimary: i === 0 }));
  }
  if (Array.isArray(raw)) {
    return raw.map((item, i) => {
      if (typeof item === "string") return { url: item, alt: "", isPrimary: i === 0 };
      const obj = item as Record<string, unknown>;
      return {
        url: String(obj.url || obj.src || ""),
        alt: String(obj.alt || ""),
        isPrimary: i === 0,
      };
    }).filter((img) => img.url);
  }
  return [];
}

function validateVehicle(v: Record<string, unknown>, index: number): string | null {
  for (const field of REQUIRED_FIELDS) {
    if (!v[field] && v[field] !== 0) {
      return `Vehicle at index ${index} missing required field: ${field}`;
    }
  }
  if (typeof v.vin !== "string" || v.vin.length < 5) {
    return `Vehicle at index ${index} has invalid VIN`;
  }
  return null;
}

function toRow(v: Record<string, unknown>, slugSet: Set<string>) {
  let slug = String(v.slug || "") || generateSlug(v);
  if (slugSet.has(slug)) {
    slug = `${slug}-${String(v.stock_number || v.stockNumber || v.vin)}`.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  }
  slugSet.add(slug);

  return {
    slug,
    stock_number: String(v.stock_number || v.stockNumber || ""),
    vin: String(v.vin),
    year: Number(v.year),
    make: String(v.make),
    model: String(v.model),
    trim: v.trim ? String(v.trim) : null,
    body_type: String(v.body_type || v.bodyType || "sedan"),
    condition: String(v.condition || "used"),
    price: Number(v.price),
    msrp: v.msrp ? Number(v.msrp) : null,
    internet_price: v.internet_price || v.internetPrice ? Number(v.internet_price || v.internetPrice) : null,
    mileage: Number(v.mileage || 0),
    exterior_color: String(v.exterior_color || v.exteriorColor || ""),
    interior_color: String(v.interior_color || v.interiorColor || ""),
    transmission: String(v.transmission || "Automatic"),
    drivetrain: String(v.drivetrain || "FWD"),
    engine: String(v.engine || ""),
    fuel_type: String(v.fuel_type || v.fuelType || "Gasoline"),
    images: parseImages(v.images || v.photos),
    thumbnail_url: v.thumbnail_url || v.thumbnailUrl ? String(v.thumbnail_url || v.thumbnailUrl) : null,
    description: v.description ? String(v.description) : null,
    features: Array.isArray(v.features) ? v.features.map(String) : [],
    highlights: Array.isArray(v.highlights) ? v.highlights.map(String) : null,
    is_commercial: Boolean(v.is_commercial || v.isCommercial),
    is_featured: Boolean(v.is_featured || v.isFeatured),
    is_new_arrival: Boolean(v.is_new_arrival || v.isNewArrival),
    is_sold: false,
    date_added: v.date_added ? String(v.date_added) : new Date().toISOString(),
    date_modified: new Date().toISOString(),
  };
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.INVENTORY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ message: "Server misconfiguration" }, { status: 500 });
    }

    const auth = request.headers.get("authorization");
    if (!auth || auth !== `Bearer ${apiKey}`) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const vehicles = Array.isArray(body) ? body : body.vehicles;

    if (!Array.isArray(vehicles) || vehicles.length === 0) {
      return NextResponse.json({ message: "Expected an array of vehicles" }, { status: 400 });
    }

    const errors: string[] = [];
    const validRows: Record<string, unknown>[] = [];
    const slugSet = new Set<string>();
    const vins: string[] = [];

    for (let i = 0; i < vehicles.length; i++) {
      const err = validateVehicle(vehicles[i], i);
      if (err) {
        errors.push(err);
        continue;
      }
      const row = toRow(vehicles[i], slugSet);
      validRows.push(row);
      vins.push(row.vin);
    }

    if (validRows.length === 0) {
      return NextResponse.json({ inserted: 0, updated: 0, deactivated: 0, errors }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json({ message: "Supabase not configured" }, { status: 500 });
    }

    const hdrs = {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation,resolution=merge-duplicates",
    };

    // Get existing VINs to count inserts vs updates
    const existingRes = await fetch(
      `${url}/rest/v1/inventory?select=vin&vin=in.(${vins.map((v) => `"${v}"`).join(",")})`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    const existingVins = new Set(
      existingRes.ok ? ((await existingRes.json()) as { vin: string }[]).map((r) => r.vin) : []
    );

    // Batch upsert in chunks of 100
    const BATCH_SIZE = 100;
    let inserted = 0;
    let updated = 0;

    for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
      const batch = validRows.slice(i, i + BATCH_SIZE);
      const res = await fetch(`${url}/rest/v1/inventory?on_conflict=vin`, {
        method: "POST",
        headers: hdrs,
        body: JSON.stringify(batch),
      });

      if (!res.ok) {
        const text = await res.text();
        errors.push(`Batch upsert error at offset ${i}: ${text}`);
        continue;
      }

      for (const row of batch) {
        if (existingVins.has(String(row.vin))) {
          updated++;
        } else {
          inserted++;
        }
      }
    }

    // Mark vehicles NOT in the payload as sold
    const deactivateRes = await fetch(
      `${url}/rest/v1/inventory?is_sold=eq.false&vin=not.in.(${vins.map((v) => `"${v}"`).join(",")})`,
      {
        method: "PATCH",
        headers: { ...hdrs, Prefer: "return=representation" },
        body: JSON.stringify({ is_sold: true, date_modified: new Date().toISOString() }),
      }
    );
    const deactivated = deactivateRes.ok ? ((await deactivateRes.json()) as unknown[]).length : 0;

    return NextResponse.json({ inserted, updated, deactivated, errors });
  } catch (err) {
    console.error("Inventory ingest error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
