/**
 * Parses an AutoFunds CSV export into the shape expected by /api/inventory/ingest.
 *
 * AutoFunds quirks handled here:
 *  - Fields are double-quoted and may contain commas, newlines, and pipe chars
 *  - PhotoUrls and Options are pipe-delimited lists inside a single quoted field
 *  - Price fields may be empty strings (treat as 0 / absent)
 *  - FuelType uses verbose labels like "Gasoline Fuel" instead of "gasoline"
 *  - Body uses verbose labels like "4 Door Sedan" / "Sport Utility"
 */

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
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  doors?: number;
  passengers?: number;
  engine?: string;
  cylinders?: number;
  exteriorColor?: string;
  interiorColor?: string;
  description?: string;
  images: { url: string; alt: string; isPrimary: boolean }[];
  features: string[];
  drivetrain?: string;
  estimatedPayment?: number;
  dateModified?: string;
}

function parsePrice(raw: string): number {
  const n = parseFloat(raw.replace(/[$,]/g, "").trim());
  return isNaN(n) ? 0 : n;
}

function normalizeBodyType(raw: string): string {
  const s = raw.toLowerCase();
  if (s.includes("suv") || s.includes("sport utility") || s.includes("utility")) return "suv";
  if (s.includes("truck") || s.includes("pickup")) return "truck";
  if (s.includes("van") || s.includes("minivan")) return "van";
  if (s.includes("coupe") || s.includes("2 door") || s.includes("2dr")) return "coupe";
  if (s.includes("convertible") || s.includes("cabriolet")) return "convertible";
  if (s.includes("wagon") || s.includes("wgn")) return "wagon";
  if (s.includes("hatch")) return "hatchback";
  if (s.includes("sedan") || s.includes("4 door") || s.includes("4dr") || s.includes("car")) return "sedan";
  return "sedan";
}

function normalizeFuelType(raw: string): string {
  const s = raw.toLowerCase();
  if (s.includes("electric")) return "electric";
  if (s.includes("hybrid")) return "hybrid";
  if (s.includes("diesel")) return "diesel";
  return "gasoline";
}

function normalizeDrivetrain(raw: string): string {
  const s = raw.toUpperCase().trim();
  if (s === "AWD" || s === "ALL WHEEL DRIVE") return "AWD";
  if (s === "4WD" || s === "4X4" || s === "FOUR WHEEL DRIVE") return "4WD";
  if (s === "RWD" || s === "REAR WHEEL DRIVE") return "RWD";
  return "FWD";
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
  const rows = parseCsvRows(csvText);
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.trim());
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

    if (!vin || !yearRaw || !make || !model) continue;

    const year = parseInt(yearRaw, 10);
    if (isNaN(year)) continue;

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
          .map((u) => u.trim())
          .filter(Boolean)
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
      mileage: parseInt(get(COL.mileage), 10) || 0,
      fuelType: get(COL.fuelType) ? normalizeFuelType(get(COL.fuelType)) : undefined,
      transmission: get(COL.transmission) || undefined,
      bodyType: get(COL.body) ? normalizeBodyType(get(COL.body)) : undefined,
      doors: doorsRaw ? parseInt(doorsRaw, 10) || undefined : undefined,
      passengers: seatingRaw ? parseInt(seatingRaw, 10) || undefined : undefined,
      engine: engineDesc || undefined,
      cylinders: cylindersRaw ? parseInt(cylindersRaw, 10) || undefined : undefined,
      exteriorColor: get(COL.extColor) || undefined,
      interiorColor: get(COL.intColor) || undefined,
      description: get(COL.comments) || undefined,
      images,
      features,
      drivetrain: get(COL.drivetrain) ? normalizeDrivetrain(get(COL.drivetrain)) : undefined,
      estimatedPayment: paymentRaw ? parsePrice(paymentRaw) || undefined : undefined,
      dateModified: get(COL.lastModified) || undefined,
    });
  }

  return vehicles;
}
