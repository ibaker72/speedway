/**
 * Parses an AutoFunds CSV export into the shape expected by /api/inventory/ingest.
 *
 * AutoFunds quirks handled here:
 *  - Fields are double-quoted and may contain commas, newlines, and pipe chars
 *  - PhotoUrls and Options are pipe-delimited lists inside a single quoted field
 *  - Price fields may be empty strings (treat as 0 / absent)
 *  - FuelType uses verbose labels like "Gasoline Fuel" instead of "gasoline"
 *  - Body uses verbose labels like "4 Door Sedan" / "Sport Utility"
 *  - DriveTrain and other spec cells can be blank
 *
 * Spec cells are normalized with lib/inventory/specs.ts and are left
 * undefined when blank or unrecognized — never defaulted (a blank DriveTrain
 * used to become "FWD"). The untouched cells are kept in `feed` so the
 * importer can corroborate them against trim text and the Options list, and
 * so they remain auditable in inventory.raw_data.
 */

import { normalizeVehicleImageUrl } from "@/lib/images/vehicle-image-url";
import { parseBodyType, parseDrivetrain, parseFuel, type BodyType, type Drivetrain, type FuelType } from "@/lib/inventory/specs";

export interface AutofundsVehicle {
  stockNumber: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  condition: string;
  price: number;
  internetPrice?: number;
  mileage: number;
  fuelType?: FuelType;
  transmission?: string;
  bodyType?: BodyType;
  doors?: number;
  passengers?: number;
  engine?: string;
  cylinders?: number;
  exteriorColor?: string;
  interiorColor?: string;
  description?: string;
  images: { url: string; alt: string; isPrimary: boolean }[];
  features: string[];
  drivetrain?: Drivetrain;
  estimatedPayment?: number;
  dateModified?: string;
  /** Original CSV cells (except PhotoUrls/Options, which are stored parsed). */
  feed?: Record<string, string>;
}

export interface ParseDiagnostics {
  csvRowCount: number;
  dataRowCount: number;
  headers: string[];
  missingRequiredHeaders: string[];
  unknownHeaders: string[];
  skipReasons: Record<string, number>;
}

export interface ParseResult {
  vehicles: AutofundsVehicle[];
  diagnostics: ParseDiagnostics;
}

const REQUIRED_HEADERS = ["VIN", "Year", "Make", "Model"] as const;

const KNOWN_HEADERS = new Set<string>([
  "DealerID",
  "StockNumber",
  "VIN",
  "Year",
  "Make",
  "Model",
  "Trim",
  "Condition",
  "InternetSpecial",
  "InternetReduced",
  "Mileage",
  "FuelType",
  "Transmission",
  "Body",
  "SeatingCapacity",
  "DoorsCount",
  "EngineDescription",
  "Cylinders",
  "ExteriorColor",
  "InteriorColor",
  "Comments",
  "PhotoUrls",
  "Options",
  "DriveTrain",
  "PaymentPrice",
  "LastModifiedDate",
]);

function parsePrice(raw: string): number {
  const n = parseFloat(raw.replace(/[$,]/g, "").trim());
  return isNaN(n) ? 0 : n;
}

/**
 * Minimal RFC-4180 CSV parser that handles:
 *  - Double-quoted fields (quotes inside a field are escaped as "")
 *  - Fields containing commas, newlines, and pipe characters
 */
function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let i = 0;
  const n = text.length;

  while (i < n) {
    const row: string[] = [];
    // Skip lone \r at start of row
    if (text[i] === "\r") i++;
    if (i >= n) break;

    while (i < n) {
      if (text[i] === '"') {
        // Quoted field
        i++; // skip opening quote
        let field = "";
        while (i < n) {
          if (text[i] === '"') {
            if (i + 1 < n && text[i + 1] === '"') {
              field += '"';
              i += 2;
            } else {
              i++; // skip closing quote
              break;
            }
          } else {
            field += text[i++];
          }
        }
        row.push(field);
      } else {
        // Unquoted field
        let field = "";
        while (i < n && text[i] !== "," && text[i] !== "\n" && text[i] !== "\r") {
          field += text[i++];
        }
        row.push(field.trim());
      }

      // After field: comma = next field, newline = next row, end = done
      if (i < n && text[i] === ",") {
        i++;
      } else {
        break;
      }
    }

    // Consume line ending
    if (i < n && text[i] === "\r") i++;
    if (i < n && text[i] === "\n") i++;

    if (row.length > 0) rows.push(row);
  }

  return rows;
}

export function parseAutofundsCsv(csvText: string): AutofundsVehicle[] {
  return parseAutofundsCsvDetailed(csvText).vehicles;
}

export function parseAutofundsCsvDetailed(csvText: string): ParseResult {
  const rows = parseCsvRows(csvText);
  const diagnostics: ParseDiagnostics = {
    csvRowCount: rows.length,
    dataRowCount: Math.max(0, rows.length - 1),
    headers: [],
    missingRequiredHeaders: [],
    unknownHeaders: [],
    skipReasons: {},
  };

  if (rows.length < 2) {
    diagnostics.missingRequiredHeaders = [...REQUIRED_HEADERS];
    return { vehicles: [], diagnostics };
  }

  const headers = rows[0].map((h) => h.trim());
  diagnostics.headers = headers;
  diagnostics.missingRequiredHeaders = REQUIRED_HEADERS.filter(
    (h) => !headers.includes(h)
  );
  diagnostics.unknownHeaders = headers.filter((h) => h && !KNOWN_HEADERS.has(h));

  const bump = (reason: string) => {
    diagnostics.skipReasons[reason] = (diagnostics.skipReasons[reason] ?? 0) + 1;
  };

  const idx = (name: string) => headers.indexOf(name);

  const COL = {
    dealerId: idx("DealerID"),
    stock: idx("StockNumber"),
    vin: idx("VIN"),
    year: idx("Year"),
    make: idx("Make"),
    model: idx("Model"),
    trim: idx("Trim"),
    condition: idx("Condition"),
    internetSpecial: idx("InternetSpecial"),
    internetReduced: idx("InternetReduced"),
    mileage: idx("Mileage"),
    fuelType: idx("FuelType"),
    transmission: idx("Transmission"),
    body: idx("Body"),
    seating: idx("SeatingCapacity"),
    doors: idx("DoorsCount"),
    engineDesc: idx("EngineDescription"),
    cylinders: idx("Cylinders"),
    extColor: idx("ExteriorColor"),
    intColor: idx("InteriorColor"),
    comments: idx("Comments"),
    photoUrls: idx("PhotoUrls"),
    options: idx("Options"),
    drivetrain: idx("DriveTrain"),
    paymentPrice: idx("PaymentPrice"),
    lastModified: idx("LastModifiedDate"),
  };

  const vehicles: AutofundsVehicle[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const get = (col: number) => (col >= 0 && col < row.length ? row[col].trim() : "");

    const vin = get(COL.vin);
    const yearRaw = get(COL.year);
    const make = get(COL.make);
    const model = get(COL.model);

    if (!vin) { bump("missing VIN"); continue; }
    if (!yearRaw) { bump("missing Year"); continue; }
    if (!make) { bump("missing Make"); continue; }
    if (!model) { bump("missing Model"); continue; }

    const year = parseInt(yearRaw, 10);
    if (isNaN(year)) { bump("invalid Year"); continue; }

    const internetSpecialRaw = get(COL.internetSpecial);
    const internetReducedRaw = get(COL.internetReduced);
    const internetSpecial = parsePrice(internetSpecialRaw);
    const internetReduced = parsePrice(internetReducedRaw);

    const price = internetSpecial > 0 ? internetSpecial : internetReduced;
    const internetPrice = internetSpecial > 0 ? internetSpecial : undefined;

    const photoUrlsRaw = get(COL.photoUrls);
    const images = photoUrlsRaw
      ? photoUrlsRaw
          .split("|")
          .map((u) => normalizeVehicleImageUrl(u))
          .filter((u): u is string => Boolean(u))
          .map((url, i) => ({
            url,
            alt: `${yearRaw} ${make} ${model}`,
            isPrimary: i === 0,
          }))
      : [];

    const optionsRaw = get(COL.options);
    const features = optionsRaw
      ? optionsRaw
          .split("|")
          .map((f) => f.trim())
          .filter(Boolean)
      : [];

    const feed: Record<string, string> = {};
    headers.forEach((header, col) => {
      if (!header || header === "PhotoUrls" || header === "Options") return;
      const value = get(col);
      if (value) feed[header] = value.slice(0, 10000);
    });

    const cylindersRaw = get(COL.cylinders);
    const doorsRaw = get(COL.doors);
    const seatingRaw = get(COL.seating);
    const paymentRaw = get(COL.paymentPrice);
    const engineDesc = get(COL.engineDesc);

    vehicles.push({
      stockNumber: get(COL.stock),
      vin,
      year,
      make,
      model,
      trim: get(COL.trim) || undefined,
      condition: (get(COL.condition) || "used").toLowerCase(),
      price,
      internetPrice,
      mileage: parseInt(get(COL.mileage).replace(/[,\s]/g, ""), 10) || 0,
      fuelType: parseFuel(get(COL.fuelType))?.type,
      transmission: get(COL.transmission) || undefined,
      bodyType: parseBodyType(get(COL.body)) ?? undefined,
      doors: doorsRaw ? parseInt(doorsRaw, 10) || undefined : undefined,
      passengers: seatingRaw ? parseInt(seatingRaw, 10) || undefined : undefined,
      engine: engineDesc || undefined,
      cylinders: cylindersRaw ? parseInt(cylindersRaw, 10) || undefined : undefined,
      exteriorColor: get(COL.extColor) || undefined,
      interiorColor: get(COL.intColor) || undefined,
      description: get(COL.comments) || undefined,
      images,
      features,
      drivetrain: parseDrivetrain(get(COL.drivetrain)) ?? undefined,
      estimatedPayment: paymentRaw ? parsePrice(paymentRaw) || undefined : undefined,
      dateModified: get(COL.lastModified) || undefined,
      feed,
    });
  }

  return { vehicles, diagnostics };
}
