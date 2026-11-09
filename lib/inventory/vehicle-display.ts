import { assessDealerDescription, dealerNoteFrom, descriptionParagraphs } from "@/lib/descriptions/assess";
import { buildDescriptionFacts, type DealerContext } from "@/lib/descriptions/facts";
import { generateTemplateDescription } from "@/lib/descriptions/template";
import { cleanEquipmentList, selectFeatureHighlights, type FeatureHighlight } from "@/lib/inventory/features";
import {
  SPECS_VERSION,
  bodyTypeLabel,
  displayTrim,
  drivetrainLabel,
  normalizeVehicleSpecs,
  vinCheckDigitValid,
  type VehicleSpecs,
} from "@/lib/inventory/specs";
import type { Vehicle } from "@/lib/types/vehicle";

/**
 * Pure helpers that turn a Vehicle into what the detail page, metadata, and
 * structured data display. Everything shown comes from normalized specs, so
 * an unknown or contradictory value is omitted everywhere at once.
 */

export function vehicleSpecs(vehicle: Vehicle): VehicleSpecs {
  if (vehicle.specs?.version === SPECS_VERSION) return vehicle.specs;
  return normalizeVehicleSpecs({
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    trim: vehicle.trim,
    drivetrain: vehicle.drivetrain,
    transmission: vehicle.transmission,
    fuelType: vehicle.fuelType,
    engine: vehicle.engine,
    cylinders: vehicle.cylinders,
    body: vehicle.bodyType,
    exteriorColor: vehicle.exteriorColor,
    interiorColor: vehicle.interiorColor,
    mileage: vehicle.mileage,
    vin: vehicle.vin,
    stockNumber: vehicle.stockNumber,
    seating: vehicle.passengers,
    features: vehicle.features,
  });
}

/** "2012 Jeep Wrangler Unlimited" (headline) and the trim shown beneath it. */
export function vehicleHeadline(vehicle: Pick<Vehicle, "year" | "make" | "model" | "trim">): { title: string; trim: string } {
  return {
    title: [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ").replace(/\s+/g, " ").trim(),
    trim: displayTrim(vehicle.trim),
  };
}

export function formatMiles(miles: number): string {
  return `${new Intl.NumberFormat("en-US").format(miles)} miles`;
}

export interface SpecRow {
  key: string;
  label: string;
  value: string;
}

/** Every verified spec, in the order shoppers scan them. Unknown values are omitted. */
export function specRows(vehicle: Vehicle, specs: VehicleSpecs): SpecRow[] {
  const rows: (SpecRow | null)[] = [
    specs.mileage ? { key: "mileage", label: "Mileage", value: formatMiles(specs.mileage) } : null,
    specs.drivetrain ? { key: "drivetrain", label: "Drivetrain", value: drivetrainLabel(specs.drivetrain) } : null,
    specs.engine ? { key: "engine", label: "Engine", value: specs.engine.label } : null,
    specs.transmission ? { key: "transmission", label: "Transmission", value: specs.transmission.label } : null,
    specs.fuel ? { key: "fuel", label: "Fuel Type", value: specs.fuel.label } : null,
    specs.bodyType ? { key: "body", label: "Body Style", value: bodyTypeLabel(specs.bodyType) } : null,
    specs.exteriorColor ? { key: "exterior", label: "Exterior Color", value: specs.exteriorColor } : null,
    specs.interiorColor ? { key: "interior", label: "Interior Color", value: specs.interiorColor } : null,
    specs.seating ? { key: "seating", label: "Seating", value: `${specs.seating} passengers` } : null,
    { key: "year", label: "Year", value: String(vehicle.year) },
    { key: "make", label: "Make", value: vehicle.make },
    { key: "model", label: "Model", value: vehicle.model.replace(/\s+/g, " ").trim() },
    displayTrim(vehicle.trim) ? { key: "trim", label: "Trim", value: displayTrim(vehicle.trim) } : null,
    specs.vin ? { key: "vin", label: "VIN", value: specs.vin } : null,
    specs.stockNumber ? { key: "stock", label: "Stock #", value: specs.stockNumber } : null,
  ];
  return rows.filter((row): row is SpecRow => row !== null);
}

/** The four or five facts shown beside the price. */
export function keySpecRows(vehicle: Vehicle, specs: VehicleSpecs): SpecRow[] {
  const wanted = ["mileage", "drivetrain", "engine", "transmission", "exterior", "fuel"];
  const rows = specRows(vehicle, specs);
  return wanted
    .map((key) => rows.find((row) => row.key === key))
    .filter((row): row is SpecRow => Boolean(row))
    .map((row) => (row.key === "drivetrain" && specs.drivetrain ? { ...row, value: specs.drivetrain } : row))
    .slice(0, 6);
}

export interface VehicleOverviewContent {
  paragraphs: string[];
  source: "manual" | "feed" | "generated";
  dealerNote: string | null;
}

/**
 * The overview text for a listing. Uses the stored description when it is a
 * real description; otherwise generates one from verified data at render
 * time (pure template — no network, no cost). Never returns the old
 * "No description available" state.
 */
export function vehicleOverview(vehicle: Vehicle, specs: VehicleSpecs, dealer: DealerContext): VehicleOverviewContent {
  const stored = vehicle.description?.trim() ?? "";
  const source = vehicle.descriptionSource;
  const dealerNote = vehicle.dealerNote ?? null;

  if (stored && (source === "manual" || source === "generated")) {
    return { paragraphs: descriptionParagraphs(stored), source, dealerNote };
  }
  if (stored && assessDealerDescription(stored, { vin: specs.vin }).usable) {
    return { paragraphs: descriptionParagraphs(stored), source: source ?? "feed", dealerNote };
  }

  // Unusable or missing: keep any short dealer note, and describe the vehicle from its data.
  const note = dealerNote ?? dealerNoteFrom(stored, "generated", specs.vin);
  const facts = buildDescriptionFacts(vehicle, specs, dealer);
  return { paragraphs: descriptionParagraphs(generateTemplateDescription(facts)), source: "generated", dealerNote: note };
}

export function vehicleHighlights(vehicle: Vehicle, max = 10): FeatureHighlight[] {
  return selectFeatureHighlights(vehicle.features, max);
}

export function vehicleEquipment(vehicle: Vehicle): string[] {
  return cleanEquipmentList(vehicle.features);
}

/** Descriptive, per-photo alt text: "2012 Jeep Wrangler Unlimited Sport in Dozer — photo 3 of 31". */
export function vehicleImageAlt(vehicle: Pick<Vehicle, "year" | "make" | "model" | "trim">, specs: Pick<VehicleSpecs, "exteriorColor">, index: number, total: number): string {
  const { title, trim } = vehicleHeadline(vehicle);
  const name = [title, trim].filter(Boolean).join(" ");
  const color = specs.exteriorColor ? ` in ${specs.exteriorColor}` : "";
  return total > 1 ? `${name}${color} — photo ${index + 1} of ${total}` : `${name}${color}`;
}

/** Carfax/CarGurus links only make sense for a well-formed VIN. */
export function hasLinkableVin(specs: VehicleSpecs): boolean {
  return Boolean(specs.vin && specs.vin.length === 17 && vinCheckDigitValid(specs.vin));
}
