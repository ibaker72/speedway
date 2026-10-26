import { describe, it, expect } from "vitest";
import { dealerConfig } from "@/dealer.config";
import { serializeJsonLd } from "@/components/seo/JsonLdScript";
import {
  buildAutoDealerJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildVehicleJsonLd,
  hasPublishedPrice,
} from "@/lib/seo/schema";
import { GENERAL_FAQS, toFaqItems } from "@/lib/data/faqs";
import type { Vehicle } from "@/lib/types/vehicle";

function vehicle(overrides: Partial<Vehicle> = {}): Vehicle {
  return {
    id: "1",
    slug: "2021-honda-accord-sport",
    stockNumber: "SM100",
    vin: "1HGCV1F34MA000001",
    year: 2021,
    make: "Honda",
    model: "Accord",
    trim: "Sport",
    bodyType: "sedan",
    condition: "used",
    price: 23995,
    mileage: 35120,
    exteriorColor: "Platinum White",
    interiorColor: "Black",
    transmission: "CVT",
    drivetrain: "FWD",
    engine: "1.5L Turbo I4",
    fuelType: "Gasoline",
    images: [{ url: "https://images.autofunds.net/a.jpg", alt: "", isPrimary: true }],
    features: [],
    isCommercial: false,
    isFeatured: false,
    isNewArrival: false,
    isSold: false,
    dateAdded: "2026-10-01",
    ...overrides,
  };
}

describe("vehicle structured data", () => {
  it("describes the vehicle as a used Car with an in-stock offer", () => {
    const data = buildVehicleJsonLd(vehicle());
    expect(data["@type"]).toBe("Car");
    expect(data.name).toBe("2021 Honda Accord Sport");
    expect(data.url).toBe("https://www.speedwaymotorsllc.com/inventory/2021-honda-accord-sport");
    expect(data.vehicleIdentificationNumber).toBe("1HGCV1F34MA000001");
    expect(data.itemCondition).toBe("https://schema.org/UsedCondition");
    expect(data.mileageFromOdometer).toEqual({ "@type": "QuantitativeValue", value: 35120, unitCode: "SMI" });
    expect(data.image).toEqual(["https://images.autofunds.net/a.jpg"]);
    expect(data.offers).toMatchObject({
      "@type": "Offer",
      price: 23995,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: "https://www.speedwaymotorsllc.com/inventory/2021-honda-accord-sport",
      seller: { "@id": "https://www.speedwaymotorsllc.com/#organization" },
    });
  });

  it("never publishes a $0 offer for call-for-price vehicles", () => {
    const data = buildVehicleJsonLd(vehicle({ price: 0 }));
    expect(hasPublishedPrice({ price: 0 })).toBe(false);
    expect(data.offers).toBeUndefined();
  });

  it("omits attributes the listing does not have", () => {
    const data = buildVehicleJsonLd(vehicle({ trim: undefined, engine: "", images: [], description: undefined }));
    expect(data.name).toBe("2021 Honda Accord");
    expect(data).not.toHaveProperty("vehicleEngine");
    expect(data).not.toHaveProperty("image");
    expect(data).not.toHaveProperty("description");
    expect(data).not.toHaveProperty("vehicleConfiguration");
  });
});

describe("dealership structured data", () => {
  const data = buildAutoDealerJsonLd();

  it("uses the verified business identity from dealer.config.ts", () => {
    const main = dealerConfig.locations[0];
    expect(data["@type"]).toBe("AutoDealer");
    expect(data.name).toBe(dealerConfig.name);
    expect(data.telephone).toBe("+18622642777");
    expect(data.address).toEqual({
      "@type": "PostalAddress",
      streetAddress: main.address,
      addressLocality: main.city,
      addressRegion: main.state,
      postalCode: main.zip,
      addressCountry: "US",
    });
    expect(data.sameAs).toEqual([dealerConfig.facebook, dealerConfig.instagram]);
  });

  it("publishes Monday–Saturday hours and omits the closed day", () => {
    expect(data.openingHoursSpecification).toEqual([
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:30",
        closes: "19:00",
      },
    ]);
  });

  it("contains no unverified ratings, reviews, employee counts, or coordinates", () => {
    const json = JSON.stringify(data);
    expect(json).not.toContain("aggregateRating");
    expect(json).not.toContain("review");
    expect(json).not.toContain("numberOfEmployees");
    expect(json).not.toContain("GeoCoordinates");
    expect(data.logo).toBe("https://www.speedwaymotorsllc.com/apple-icon");
  });
});

describe("FAQ and breadcrumb structured data", () => {
  it("mirrors the visible FAQ text exactly, including linked phrases", () => {
    const items = toFaqItems(GENERAL_FAQS);
    const data = buildFaqJsonLd(items);
    expect(data.mainEntity).toHaveLength(GENERAL_FAQS.length);
    const financing = data.mainEntity.find((q) => q.name.startsWith("What financing"));
    expect(financing?.acceptedAnswer.text).toContain("sub-prime financing");
  });

  it("builds absolute breadcrumb URLs", () => {
    const data = buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Inventory", path: "/inventory" },
    ]);
    expect(data.itemListElement[1]).toEqual({
      "@type": "ListItem",
      position: 2,
      name: "Inventory",
      item: "https://www.speedwaymotorsllc.com/inventory",
    });
  });
});

describe("JSON-LD serialization", () => {
  it("escapes markup so feed text cannot break out of the script tag", () => {
    const out = serializeJsonLd({ description: "</script><script>alert(1)</script> & more" });
    expect(out).not.toContain("</script>");
    expect(out).not.toContain("<");
    expect(JSON.parse(out).description).toBe("</script><script>alert(1)</script> & more");
  });
});
