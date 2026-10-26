import { dealerConfig } from "@/dealer.config";
import { HOURS } from "@/lib/constants";
import { ORGANIZATION_ID, SITE_URL, absoluteUrl } from "@/lib/seo/site";
import type { Vehicle } from "@/lib/types/vehicle";

/**
 * Structured-data builders. Every value here must match what a visitor can
 * see on the page and must come from verified dealership configuration or
 * live inventory. Ratings, review counts, employee counts, and awards are
 * intentionally omitted: they are unverified, and Google does not show
 * self-served review stars for a business on its own site.
 */

const mainLocation = dealerConfig.locations[0];

// Communities the dealership serves from its single Paterson showroom.
const AREA_SERVED: { name: string; state: string }[] = [
  { name: "Paterson", state: "New Jersey" },
  { name: "Clifton", state: "New Jersey" },
  { name: "Passaic", state: "New Jersey" },
  { name: "Totowa", state: "New Jersey" },
  { name: "Fair Lawn", state: "New Jersey" },
  { name: "Hawthorne", state: "New Jersey" },
  { name: "Wayne", state: "New Jersey" },
  { name: "Garfield", state: "New Jersey" },
  { name: "Elmwood Park", state: "New Jersey" },
  { name: "Saddle Brook", state: "New Jersey" },
  { name: "Little Falls", state: "New Jersey" },
  { name: "Woodland Park", state: "New Jersey" },
  { name: "Haledon", state: "New Jersey" },
  { name: "Prospect Park", state: "New Jersey" },
  { name: "North Haledon", state: "New Jersey" },
  { name: "Newark", state: "New Jersey" },
  { name: "Jersey City", state: "New Jersey" },
  { name: "Hackensack", state: "New Jersey" },
  { name: "Elizabeth", state: "New Jersey" },
  { name: "Hoboken", state: "New Jersey" },
  { name: "Union City", state: "New Jersey" },
  { name: "Bloomfield", state: "New Jersey" },
  { name: "Yonkers", state: "New York" },
  { name: "Bronx", state: "New York" },
];

export function postalAddress() {
  return {
    "@type": "PostalAddress",
    streetAddress: mainLocation.address,
    addressLocality: mainLocation.city,
    addressRegion: mainLocation.state,
    postalCode: mainLocation.zip,
    addressCountry: "US",
  };
}

function to24h(time: string): string {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time.trim());
  if (!match) return time;
  let hours = Number(match[1]) % 12;
  if (match[3].toUpperCase() === "PM") hours += 12;
  return `${String(hours).padStart(2, "0")}:${match[2]}`;
}

/** Opening hours from the same HOURS constant the footer renders. Closed days are omitted. */
export function openingHoursSpecification() {
  const groups = new Map<string, { opens: string; closes: string; days: string[] }>();
  for (const { day, open, close } of HOURS) {
    if (open === "Closed") continue;
    const key = `${open}-${close}`;
    const group = groups.get(key) ?? { opens: to24h(open), closes: to24h(close), days: [] };
    group.days.push(day);
    groups.set(key, group);
  }
  return [...groups.values()].map((group) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: group.days,
    opens: group.opens,
    closes: group.closes,
  }));
}

export function buildAutoDealerJsonLd() {
  const telephone = dealerConfig.phoneHref.replace(/^tel:/, "");
  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "@id": ORGANIZATION_ID,
    name: dealerConfig.name,
    alternateName: dealerConfig.shortName,
    url: `${SITE_URL}/`,
    logo: absoluteUrl("/apple-icon"),
    image: absoluteUrl("/opengraph-image"),
    description: dealerConfig.description,
    telephone,
    email: dealerConfig.email,
    foundingDate: String(dealerConfig.established),
    currenciesAccepted: "USD",
    address: postalAddress(),
    hasMap: `https://www.google.com/maps?q=${encodeURIComponent(
      `${mainLocation.address}, ${mainLocation.city}, ${mainLocation.state} ${mainLocation.zip}`
    )}`,
    openingHoursSpecification: openingHoursSpecification(),
    areaServed: AREA_SERVED.map(({ name, state }) => ({
      "@type": "City",
      name,
      containedInPlace: { "@type": "State", name: state },
    })),
    sameAs: [dealerConfig.facebook, dealerConfig.instagram],
    makesOffer: ["Used Car Sales", "Auto Financing", "Vehicle Trade-In", "Commercial Vehicle Sales"].map((name) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name },
    })),
  };
}

export interface BreadcrumbItem {
  name: string;
  /** Site-relative path or absolute URL. */
  path: string;
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * FAQPage markup must mirror FAQ text that is visible on the same page.
 * (Google currently limits FAQ rich results to authoritative government and
 * health sites, so this is for machine readability, not a rich result.)
 */
export function buildFaqJsonLd(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function vehicleName(vehicle: Pick<Vehicle, "year" | "make" | "model" | "trim">): string {
  return [vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

export function vehiclePath(vehicle: Pick<Vehicle, "slug">): string {
  return `/inventory/${vehicle.slug}`;
}

/** Vehicles with a non-positive price are "call for price"; never publish $0. */
export function hasPublishedPrice(vehicle: Pick<Vehicle, "price">): boolean {
  return Number.isFinite(vehicle.price) && vehicle.price > 0;
}

/**
 * Car markup for a vehicle detail page. Only attributes rendered on the page
 * are included. Note: Google retired its dedicated vehicle-listing rich result
 * in 2025, so this markup describes the listing for search and AI systems but
 * is not expected to produce a special search feature on its own.
 */
export function buildVehicleJsonLd(vehicle: Vehicle) {
  const url = absoluteUrl(vehiclePath(vehicle));
  const images = vehicle.images.map((image) => image.url).filter(Boolean).slice(0, 10);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Car",
    "@id": `${url}#vehicle`,
    url,
    name: vehicleName(vehicle),
    brand: { "@type": "Brand", name: vehicle.make },
    model: vehicle.model,
    vehicleModelDate: String(vehicle.year),
    itemCondition: "https://schema.org/UsedCondition",
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: vehicle.mileage,
      unitCode: "SMI",
    },
  };

  if (vehicle.vin) jsonLd.vehicleIdentificationNumber = vehicle.vin;
  if (vehicle.trim) jsonLd.vehicleConfiguration = vehicle.trim;
  if (vehicle.bodyType) jsonLd.bodyType = vehicle.bodyType;
  if (vehicle.exteriorColor) jsonLd.color = vehicle.exteriorColor;
  if (vehicle.interiorColor) jsonLd.vehicleInteriorColor = vehicle.interiorColor;
  if (vehicle.transmission) jsonLd.vehicleTransmission = vehicle.transmission;
  if (vehicle.drivetrain) jsonLd.driveWheelConfiguration = vehicle.drivetrain;
  if (vehicle.fuelType) jsonLd.fuelType = vehicle.fuelType;
  if (vehicle.engine) jsonLd.vehicleEngine = { "@type": "EngineSpecification", name: vehicle.engine };
  if (images.length) jsonLd.image = images;
  if (vehicle.description) jsonLd.description = vehicle.description;

  if (hasPublishedPrice(vehicle)) {
    jsonLd.offers = {
      "@type": "Offer",
      url,
      price: vehicle.price,
      priceCurrency: "USD",
      itemCondition: "https://schema.org/UsedCondition",
      availability: vehicle.isSold ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      seller: { "@type": "AutoDealer", "@id": ORGANIZATION_ID, name: dealerConfig.name },
    };
  }

  return jsonLd;
}
