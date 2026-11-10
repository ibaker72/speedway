import { selectFeatureHighlights } from "@/lib/inventory/features";
import { cleanSpecText, displayTrim, type VehicleSpecs } from "@/lib/inventory/specs";

/**
 * The only inputs a generated description may use. Everything here is either
 * stated by the feed (and survived spec corroboration) or is fixed dealership
 * configuration. Price is deliberately excluded: it changes often, is shown
 * next to the description anyway, and would force regeneration on every
 * price drop.
 */
export interface DescriptionFacts {
  vin: string | null;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  bodyType: VehicleSpecs["bodyType"];
  mileage: number | null;
  engine: string | null;
  engineIsElectric: boolean;
  transmission: { type: "Automatic" | "Manual" | "CVT"; speeds: number | null } | null;
  drivetrain: VehicleSpecs["drivetrain"];
  fuel: { type: NonNullable<VehicleSpecs["fuel"]>["type"]; mild: boolean } | null;
  exteriorColor: string | null;
  interiorColor: string | null;
  seating: number | null;
  /** Feature phrases in priority order, already verified against Options. */
  highlights: string[];
  dealer: { name: string; city: string; state: string; shipping: boolean };
}

export interface DescriptionIdentity {
  vin?: string | null;
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  features?: readonly string[] | null;
}

export interface DealerContext {
  name: string;
  city: string;
  state: string;
  shipping: boolean;
}

export function buildDescriptionFacts(
  identity: DescriptionIdentity,
  specs: VehicleSpecs,
  dealer: DealerContext
): DescriptionFacts {
  return {
    vin: specs.vin,
    year: identity.year,
    make: cleanSpecText(identity.make),
    model: cleanSpecText(identity.model),
    trim: displayTrim(identity.trim) || null,
    bodyType: specs.bodyType,
    mileage: specs.mileage,
    engine: specs.engine?.label ?? null,
    engineIsElectric: specs.engine?.label === "Electric motor",
    transmission: specs.transmission ? { type: specs.transmission.type, speeds: specs.transmission.speeds } : null,
    drivetrain: specs.drivetrain,
    fuel: specs.fuel ? { type: specs.fuel.type, mild: specs.fuel.mild } : null,
    exteriorColor: specs.exteriorColor,
    interiorColor: specs.interiorColor,
    seating: specs.seating,
    highlights: selectFeatureHighlights(identity.features, 8).map((h) => h.phrase),
    dealer,
  };
}
