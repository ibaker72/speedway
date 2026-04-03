import type { GeoLocation } from "@/lib/geo/locations";

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
  return `Shop used cars near ${location.displayName} at Speedway Motors LLC in Paterson, NJ. Browse inventory, compare financing options, and value your trade-in before you visit.`;
}

export function buildFaqs(location: GeoLocation): Array<{ question: string; answer: string }> {
  const topicMap: Record<GeoLocation["faqTopics"][number], { question: string; answer: string }> = {
    distance: {
      question: `How far is Speedway Motors LLC from ${location.displayName}?`,
      answer: `Speedway Motors LLC is located at 302-304 22nd Ave, Paterson, NJ 07513. From ${location.city}, many customers can reach us in about ${Math.max(10, location.distanceMiles * 3)}–${Math.max(14, location.distanceMiles * 4)} minutes depending on traffic and route.`,
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
