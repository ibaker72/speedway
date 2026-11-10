import type { Metadata } from "next";
import { dealerConfig } from "@/dealer.config";
import { formatPrice } from "@/lib/data/vehicles-full";
import { formatMiles, vehicleHeadline, vehicleImageAlt, vehicleSpecs } from "@/lib/inventory/vehicle-display";
import { pageMetadata } from "@/lib/seo/metadata";
import { hasPublishedPrice, vehiclePath } from "@/lib/seo/schema";
import type { Vehicle } from "@/lib/types/vehicle";

const MAX_DESCRIPTION = 160;

/** Dealer comments such as "CASH DEAL ONLY !." rule out a financing claim. */
const CASH_ONLY = /\bcash[\s-]+(deal|only|sale|buyers?)\b|\bno financing\b/i;

/**
 * Unique, accurate metadata for a vehicle page. Built from the same verified
 * specs the page shows; unknown values are left out rather than guessed.
 */
export function vehicleMetaDescription(vehicle: Vehicle): string {
  const specs = vehicleSpecs(vehicle);
  const { title, trim } = vehicleHeadline(vehicle);
  const name = [title, trim].filter(Boolean).join(" ");
  const location = dealerConfig.locations[0];
  const where = `at ${dealerConfig.shortName} in ${location.city}, ${location.state}`;
  const price = hasPublishedPrice(vehicle) ? `${formatPrice(vehicle.price)} ${where}.` : `Call for price ${where}.`;

  // Most to least important; trailing parts are dropped until it fits.
  const facts = [
    specs.mileage ? formatMiles(specs.mileage) : null,
    specs.drivetrain,
    specs.engine?.label ?? null,
    specs.exteriorColor,
  ].filter((part): part is string => Boolean(part));
  const cashOnly = [vehicle.dealerNote, vehicle.description].some((text) => text && CASH_ONLY.test(text));
  const extras = [cashOnly ? null : "Financing available.", dealerConfig.features.nationwideShipping ? "Nationwide shipping on request." : null].filter(
    (part): part is string => Boolean(part)
  );

  const build = (factCount: number, extraCount: number) => {
    const lead = `Used ${name}${factCount ? `: ${facts.slice(0, factCount).join(", ")}` : ""}.`;
    return [lead, price, ...extras.slice(0, extraCount)].join(" ");
  };
  for (let f = facts.length; f >= 0; f--) {
    for (let e = extras.length; e >= 0; e--) {
      const text = build(f, e);
      if (text.length <= MAX_DESCRIPTION) return text;
    }
  }
  return build(0, 0).slice(0, MAX_DESCRIPTION - 1).trimEnd() + "…";
}

/**
 * Keeps the established "<year> <make> <model> <trim> for Sale" format and
 * appends the price, which also tells apart otherwise identical listings
 * (e.g. several same-trim cargo vans).
 */
export function vehicleMetaTitle(vehicle: Vehicle): string {
  const { title, trim } = vehicleHeadline(vehicle);
  const name = [title, trim].filter(Boolean).join(" ");
  return hasPublishedPrice(vehicle) ? `${name} for Sale – ${formatPrice(vehicle.price)}` : `${name} for Sale`;
}

export function vehicleMetadata(vehicle: Vehicle): Metadata {
  const specs = vehicleSpecs(vehicle);
  const firstImage = vehicle.images[0]?.url;
  return pageMetadata({
    title: vehicleMetaTitle(vehicle),
    description: vehicleMetaDescription(vehicle),
    path: vehiclePath(vehicle),
    images: firstImage ? [{ url: firstImage, alt: vehicleImageAlt(vehicle, specs, 0, 1) }] : undefined,
    // Sold vehicles 404 before reaching here; this is a second line of defense.
    noindex: vehicle.isSold,
  });
}
