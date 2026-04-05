import { readFileSync } from "fs";

const COLUMN_MAP: Record<string, string> = {
  "stock #": "stock_number",
  "stock": "stock_number",
  "stock_number": "stock_number",
  "stocknumber": "stock_number",
  "vin": "vin",
  "year": "year",
  "make": "make",
  "model": "model",
  "trim": "trim",
  "price": "price",
  "asking price": "price",
  "selling price": "price",
  "internet price": "internet_price",
  "msrp": "msrp",
  "mileage": "mileage",
  "odometer": "mileage",
  "miles": "mileage",
  "ext color": "exterior_color",
  "exterior color": "exterior_color",
  "exterior": "exterior_color",
  "int color": "interior_color",
  "interior color": "interior_color",
  "interior": "interior_color",
  "transmission": "transmission",
  "trans": "transmission",
  "drivetrain": "drivetrain",
  "drive type": "drivetrain",
  "drive": "drivetrain",
  "engine": "engine",
  "body style": "body_type",
  "body type": "body_type",
  "body": "body_type",
  "type": "body_type",
  "image urls": "images",
  "images": "images",
  "photos": "images",
  "photo urls": "images",
  "description": "description",
  "comments": "description",
  "features": "features",
  "options": "features",
  "condition": "condition",
  "fuel type": "fuel_type",
  "fuel": "fuel_type",
};

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseCsv(content: string): Record<string, string>[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headerLine = lines[0];
  const headers = parseCsvLine(headerLine).map((h) => {
    const normalized = h.toLowerCase().trim();
    return COLUMN_MAP[normalized] || normalized;
  });

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      if (values[i] !== undefined) row[h] = values[i];
    });
    return row;
  });
}

function mapRow(row: Record<string, string>): Record<string, unknown> {
  return {
    stock_number: row.stock_number || "",
    vin: row.vin || "",
    year: Number(row.year) || 0,
    make: row.make || "",
    model: row.model || "",
    trim: row.trim || null,
    price: Number(String(row.price).replace(/[$,]/g, "")) || 0,
    msrp: row.msrp ? Number(String(row.msrp).replace(/[$,]/g, "")) : null,
    internet_price: row.internet_price ? Number(String(row.internet_price).replace(/[$,]/g, "")) : null,
    mileage: Number(String(row.mileage).replace(/[,]/g, "")) || 0,
    exterior_color: row.exterior_color || "",
    interior_color: row.interior_color || "",
    transmission: row.transmission || "Automatic",
    drivetrain: row.drivetrain || "FWD",
    engine: row.engine || "",
    body_type: row.body_type || "sedan",
    fuel_type: row.fuel_type || "Gasoline",
    condition: row.condition || "used",
    images: row.images || "",
    description: row.description || null,
    features: row.features ? row.features.split("|").map((f: string) => f.trim()).filter(Boolean) : [],
  };
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: npx tsx scripts/import-csv.ts <path-to-csv>");
    process.exit(1);
  }

  const apiUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const apiKey = process.env.INVENTORY_API_KEY;
  if (!apiKey) {
    console.error("INVENTORY_API_KEY environment variable is required");
    process.exit(1);
  }

  console.log(`Reading CSV from: ${filePath}`);
  const content = readFileSync(filePath, "utf8");
  const rows = parseCsv(content);

  if (rows.length === 0) {
    console.error("No data rows found in CSV");
    process.exit(1);
  }

  console.log(`Parsed ${rows.length} vehicles from CSV`);
  const vehicles = rows.map(mapRow);

  console.log(`Sending to ingest API at ${apiUrl}/api/inventory/ingest ...`);
  const res = await fetch(`${apiUrl}/api/inventory/ingest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(vehicles),
  });

  if (!res.ok) {
    console.error(`API error: ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.error(text);
    process.exit(1);
  }

  const result = await res.json();
  console.log("\nImport complete:");
  console.log(`  Inserted: ${result.inserted}`);
  console.log(`  Updated:  ${result.updated}`);
  console.log(`  Deactivated: ${result.deactivated}`);
  if (result.errors?.length) {
    console.log(`  Errors (${result.errors.length}):`);
    result.errors.forEach((e: string) => console.log(`    - ${e}`));
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
