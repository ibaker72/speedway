export interface GeoLocation {
  slug: string;
  city: string;
  state: string;
  stateAbbr: string;
  county?: string;
  displayName: string;
  distanceMiles: number;
  nearbyAreas: string[];
  targetKeywords: string[];
  intro: string;
  faqTopics: Array<"distance" | "financing" | "trade-in" | "test-drive" | "documents">;
  featuredMakes?: string[];
  coordinates?: { lat: number; lng: number };
}

export const geoLocations: GeoLocation[] = [
  {
    slug: "newark-nj",
    city: "Newark",
    state: "New Jersey",
    stateAbbr: "NJ",
    county: "Essex",
    displayName: "Newark, NJ",
    distanceMiles: 13,
    nearbyAreas: ["East Orange", "Irvington", "Harrison"],
    targetKeywords: [
      "used cars near Newark NJ",
      "used car dealership near Newark",
      "car financing Newark NJ",
    ],
    intro:
      "Shopping from Newark should be straightforward. Speedway Motors gives Newark drivers a practical route to quality used vehicles, transparent pricing, and financing guidance without a high-pressure process.",
    faqTopics: ["distance", "financing", "trade-in", "test-drive", "documents"],
    featuredMakes: ["Honda", "Toyota", "Nissan"],
    coordinates: { lat: 40.7357, lng: -74.1724 },
  },
  {
    slug: "jersey-city-nj",
    city: "Jersey City",
    state: "New Jersey",
    stateAbbr: "NJ",
    county: "Hudson",
    displayName: "Jersey City, NJ",
    distanceMiles: 16,
    nearbyAreas: ["Journal Square", "The Heights", "Secaucus"],
    targetKeywords: [
      "used cars near Jersey City NJ",
      "used car financing near Jersey City",
      "trade in your car near Jersey City",
    ],
    intro:
      "If you are buying from Jersey City, our team helps you compare reliable options quickly and handle financing in one place. Many shoppers come in with a short list and leave with a vehicle that fits both commute and budget.",
    faqTopics: ["distance", "financing", "test-drive", "trade-in"],
    featuredMakes: ["Hyundai", "Honda", "Jeep"],
    coordinates: { lat: 40.7178, lng: -74.0431 },
  },
  {
    slug: "paterson-nj",
    city: "Paterson",
    state: "New Jersey",
    stateAbbr: "NJ",
    county: "Passaic",
    displayName: "Paterson, NJ",
    distanceMiles: 0,
    nearbyAreas: ["Haledon", "Prospect Park", "Totowa"],
    targetKeywords: [
      "used cars in Paterson NJ",
      "Paterson used car dealership",
      "auto financing Paterson NJ",
    ],
    intro:
      "Paterson drivers are local to our main showroom on 22nd Ave. You can browse inventory in person, review financing options, and get trade-in guidance from one team in a single visit.",
    faqTopics: ["distance", "financing", "trade-in", "test-drive", "documents"],
    featuredMakes: ["Ford", "Toyota", "Chevrolet"],
    coordinates: { lat: 40.9168, lng: -74.1718 },
  },
  {
    slug: "yonkers-ny",
    city: "Yonkers",
    state: "New York",
    stateAbbr: "NY",
    county: "Westchester",
    displayName: "Yonkers, NY",
    distanceMiles: 21,
    nearbyAreas: ["Getty Square", "Northwest Yonkers", "Hastings-on-Hudson"],
    targetKeywords: [
      "used cars near Yonkers NY",
      "trade in your car near Yonkers",
      "used car financing near Yonkers",
    ],
    intro:
      "Yonkers customers looking outside city inventory often visit Speedway for broader selection and a transparent buying process. We keep financing and trade-in steps clear so your trip is productive.",
    faqTopics: ["distance", "financing", "trade-in", "test-drive"],
    featuredMakes: ["BMW", "Mercedes-Benz", "Audi"],
    coordinates: { lat: 40.9312, lng: -73.8988 },
  },
  {
    slug: "hoboken-nj",
    city: "Hoboken",
    state: "New Jersey",
    stateAbbr: "NJ",
    county: "Hudson",
    displayName: "Hoboken, NJ",
    distanceMiles: 14,
    nearbyAreas: ["Downtown Hoboken", "Uptown Hoboken", "Weehawken"],
    targetKeywords: [
      "used cars near Hoboken NJ",
      "used SUV near Hoboken",
      "auto financing near Hoboken",
    ],
    intro:
      "Hoboken shoppers who need a dependable used car with practical financing terms can shop with Speedway online first, then visit Paterson to test drive and finalize details.",
    faqTopics: ["distance", "financing", "test-drive", "documents"],
    featuredMakes: ["Mazda", "Subaru", "Toyota"],
    coordinates: { lat: 40.743, lng: -74.0324 },
  },
  {
    slug: "clifton-nj",
    city: "Clifton",
    state: "New Jersey",
    stateAbbr: "NJ",
    county: "Passaic",
    displayName: "Clifton, NJ",
    distanceMiles: 4,
    nearbyAreas: ["Athenia", "Allwood", "Montclair Heights"],
    targetKeywords: ["used cars near Clifton NJ", "car financing Clifton NJ"],
    intro:
      "From Clifton, Speedway is a short drive for drivers who want quick access to used sedans, SUVs, and trucks with clear monthly payment options.",
    faqTopics: ["distance", "financing", "trade-in", "test-drive"],
    featuredMakes: ["Nissan", "Honda", "Kia"],
  },
  {
    slug: "passaic-nj",
    city: "Passaic",
    state: "New Jersey",
    stateAbbr: "NJ",
    county: "Passaic",
    displayName: "Passaic, NJ",
    distanceMiles: 3,
    nearbyAreas: ["Passaic Park", "Wallington", "Garfield"],
    targetKeywords: ["used cars near Passaic NJ", "trade-in near Passaic"],
    intro:
      "Passaic buyers choose Speedway for straightforward pricing, varied inventory, and support for both strong-credit and credit-rebuilding financing applications.",
    faqTopics: ["distance", "financing", "trade-in", "documents"],
    featuredMakes: ["Honda", "Hyundai", "Ford"],
  },
];

export const geoLocationBySlug = new Map(geoLocations.map((location) => [location.slug, location]));
