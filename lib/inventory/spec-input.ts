import type { AutofundsVehicle } from "@/lib/feed/autofunds-parser";
import type { SpecInput } from "@/lib/inventory/specs";

function intOrNull(value: unknown): number | null {
  const n = typeof value === "string" ? Number(value.replace(/[,\s]/g, "")) : typeof value === "number" ? value : NaN;
  return Number.isFinite(n) ? Math.round(n) : null;
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

/** Spec input for a freshly parsed feed row: the raw CSV cells are the feed source. */
export function specInputFromFeed(v: AutofundsVehicle): SpecInput {
  const cell = (name: string) => v.feed?.[name] ?? null;
  return {
    year: v.year,
    make: v.make,
    model: v.model,
    trim: v.trim ?? null,
    drivetrain: cell("DriveTrain"),
    transmission: cell("Transmission"),
    fuelType: cell("FuelType"),
    engine: cell("EngineDescription"),
    cylinders: v.cylinders ?? intOrNull(cell("Cylinders")),
    body: cell("Body"),
    exteriorColor: cell("ExteriorColor"),
    interiorColor: cell("InteriorColor"),
    mileage: v.mileage,
    vin: v.vin,
    stockNumber: v.stockNumber,
    seating: v.passengers ?? intOrNull(cell("SeatingCapacity")),
    features: v.features,
  };
}

/** The subset of an inventory row needed to (re)compute specs. */
export interface StoredSpecRow {
  vin?: string | null;
  stock_number?: string | null;
  year?: number | null;
  make?: string | null;
  model?: string | null;
  trim?: string | null;
  body_type?: string | null;
  body_style?: string | null;
  mileage?: number | null;
  exterior_color?: string | null;
  interior_color?: string | null;
  transmission?: string | null;
  drivetrain?: string | null;
  engine?: string | null;
  fuel_type?: string | null;
  features?: string[] | null;
  raw_data?: unknown;
}

/**
 * Spec input for a stored row.
 *
 * Rows imported by the current parser carry the raw CSV cells in
 * `raw_data.feed`. Rows imported before it only have the old parser's output
 * in `raw_data`; for those, `raw_data` is still a better "feed" source than
 * the columns, because the columns hold the old importer's invented defaults
 * (a blank DriveTrain is `raw_data.drivetrain = undefined` but column `FWD`).
 * Rows with no `raw_data` at all (manual inserts, the JSON ingest API) fall
 * back to their columns.
 */
export function specInputFromRow(row: StoredSpecRow): SpecInput {
  const raw = row.raw_data && typeof row.raw_data === "object" ? (row.raw_data as Record<string, unknown>) : null;
  const feed = raw?.feed && typeof raw.feed === "object" ? (raw.feed as Record<string, unknown>) : null;
  const base = {
    year: Number(row.year) || 0,
    make: row.make ?? "",
    model: row.model ?? "",
    trim: row.trim ?? null,
    mileage: row.mileage ?? null,
    vin: row.vin ?? null,
    stockNumber: row.stock_number ?? null,
    features: Array.isArray(row.features) ? row.features : [],
  };

  if (feed) {
    return {
      ...base,
      drivetrain: str(feed.DriveTrain),
      transmission: str(feed.Transmission),
      fuelType: str(feed.FuelType),
      engine: str(feed.EngineDescription),
      cylinders: intOrNull(feed.Cylinders),
      body: str(feed.Body),
      exteriorColor: str(feed.ExteriorColor),
      interiorColor: str(feed.InteriorColor),
      seating: intOrNull(feed.SeatingCapacity),
    };
  }

  if (raw && typeof raw.vin === "string") {
    // Legacy parser output. Missing keys mean the feed cell was blank.
    return {
      ...base,
      drivetrain: str(raw.drivetrain),
      transmission: str(raw.transmission),
      fuelType: str(raw.fuelType),
      engine: str(raw.engine),
      cylinders: intOrNull(raw.cylinders),
      body: str(raw.bodyType),
      exteriorColor: str(raw.exteriorColor),
      interiorColor: str(raw.interiorColor),
      seating: intOrNull(raw.passengers),
    };
  }

  return {
    ...base,
    drivetrain: row.drivetrain ?? null,
    transmission: row.transmission ?? null,
    fuelType: row.fuel_type ?? null,
    engine: row.engine ?? null,
    cylinders: null,
    body: row.body_type ?? row.body_style ?? null,
    exteriorColor: row.exterior_color ?? null,
    interiorColor: row.interior_color ?? null,
    seating: null,
  };
}
