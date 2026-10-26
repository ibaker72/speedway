import type { GeoLocation } from "@/lib/geo/locations";
import { dealerConfig } from "@/dealer.config";

const mainLocation = dealerConfig.locations[0];
const DEALER_ADDRESS = `${mainLocation.address}, ${mainLocation.city}, ${mainLocation.state} ${mainLocation.zip}`;

/** Google Maps directions from the city center to the dealership. */
export function buildDirectionsUrl(location: GeoLocation): string {
  const params = new URLSearchParams({
    api: "1",
    origin: `${location.city}, ${location.stateAbbr}`,
    destination: DEALER_ADDRESS,
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

const introClosers = [
  "You can start online and finish paperwork at the showroom when you are ready.",
  "Our team keeps the process clear so you can compare options without pressure.",
  "Most shoppers begin by browsing inventory online, then schedule a visit for a hands-on review.",
] as const;

export function buildLocationIntro(location: GeoLocation): string {
  const index = location.slug.length % introClosers.length;
  return `${location.intro} ${introClosers[index]}`;
}

export function buildLocationMetaDescription(location: GeoLocation): string {
  return location.distanceMiles > 0
    ? `Shopping for a used car near ${location.displayName}? Speedway Motors in Paterson, NJ is about ${location.distanceMiles} miles away. Browse inventory, compare financing options, and value your trade-in before you visit.`
    : `Shop used cars in ${location.displayName} at Speedway Motors. Browse inventory, compare financing options, and value your trade-in before you visit our showroom.`;
}

export function buildFaqs(location: GeoLocation): Array<{ question: string; answer: string }> {
  const topicMap: Record<GeoLocation["faqTopics"][number], { question: string; answer: string }> = {
    distance: {
      question: location.distanceMiles > 0
        ? `How far is Speedway Motors LLC from ${location.displayName}?`
        : `Where is Speedway Motors LLC in ${location.city}?`,
      answer: location.distanceMiles > 0
        ? `Speedway Motors LLC is located at ${DEALER_ADDRESS}, roughly ${location.distanceMiles} miles from ${location.city}. Drive time depends on your starting point, route, and traffic, so check live directions before you head over.`
        : `Speedway Motors LLC is located at ${DEALER_ADDRESS}. Check live directions for the best route from your part of ${location.city}.`,
    },
    financing: {
      question: `Can I finance a used car near ${location.displayName}?`,
      answer: `Yes. You can apply online before visiting, and our team will help you review available lender options based on your profile. Financing is subject to lender approval and terms.`,
    },
    "trade-in": {
      question: `Do you accept trade-ins from drivers in ${location.city}?`,
      answer: `Yes. We take trade-ins from ${location.city} area drivers and can provide an estimate after reviewing your vehicle details, condition, and market value.`,
    },
    "test-drive": {
      question: "Can I schedule a test drive online?",
      answer: "Absolutely. Pick a vehicle from inventory, request a test drive, and we will confirm availability before your visit.",
    },
    documents: {
      question: "What documents should I bring for financing?",
      answer: "Bring a valid driver license, proof of income, proof of residence, and insurance details when available. Extra documentation may be requested by lenders.",
    },
  };

  return location.faqTopics.map((topic) => topicMap[topic]);
}
