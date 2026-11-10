import { describe, it, expect, afterEach } from "vitest";
import sitemap from "@/app/sitemap";
import { allVehicles } from "@/lib/data/vehicles-full";
import { buildVehicleJsonLd } from "@/lib/seo/schema";
import { serializeJsonLd } from "@/components/seo/JsonLdScript";
import { vehicleMetaDescription, vehicleMetadata, vehicleMetaTitle } from "@/lib/seo/vehicle-metadata";
import type { Vehicle } from "@/lib/types/vehicle";

const WRANGLER: Vehicle = {
  id: "w1",
  slug: "2012-jeep-wrangler-unlimited-4wd-4dr-sport",
  stockNumber: "MZR174156",
  vin: "1C4HJWDG3CL174156",
  year: 2012,
  make: "Jeep",
  model: "Wrangler Unlimited",
  trim: "4WD 4dr Sport",
  condition: "used",
  price: 8987,
  mileage: 150215,
  exteriorColor: "Dozer",
  interiorColor: "Black Interior",
  transmission: "Automatic",
  engine: "3.6 V6 Cylinder Engine",
  cylinders: 6,
  fuelType: "Gasoline",
  bodyType: "suv",
  images: [{ url: "https://images.autofunds.net/a.jpg", alt: "", isPrimary: true }],
  features: ["Four Wheel Drive", "Gasoline Fuel", "6-speed manual transmission", "Bluetooth"],
  isCommercial: false,
  isFeatured: false,
  isNewArrival: false,
  isSold: false,
  dateAdded: "2026-06-02",
};

describe("vehicle metadata", () => {
  it("is unique per vehicle and fits search snippet length", () => {
    const titles = allVehicles.map(vehicleMetaTitle);
    const descriptions = allVehicles.map(vehicleMetaDescription);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
    for (const d of descriptions) expect(d.length).toBeLessThanOrEqual(160);
  });

  it("describes the Wrangler with verified specs only (4WD, never FWD) and canonical/Open Graph data", () => {
    const meta = vehicleMetadata(WRANGLER);
    expect(meta.title).toBe("2012 Jeep Wrangler Unlimited 4WD 4dr Sport for Sale – $8,987");
    expect(meta.description).toContain("150,215 miles");
    expect(meta.description).toContain("4WD");
    expect(meta.description).not.toContain("FWD");
    expect(meta.description).toContain("$8,987");
    expect(meta.alternates?.canonical).toBe("https://www.speedwaymotorsllc.com/inventory/2012-jeep-wrangler-unlimited-4wd-4dr-sport");
    expect(meta.openGraph).toMatchObject({
      url: "https://www.speedwaymotorsllc.com/inventory/2012-jeep-wrangler-unlimited-4wd-4dr-sport",
      images: [{ url: "https://images.autofunds.net/a.jpg", alt: "2012 Jeep Wrangler Unlimited 4WD 4dr Sport in Dozer" }],
    });
    expect(meta.robots).toEqual({ index: true, follow: true });
  });

  it("does not claim financing when the dealer's own note says cash only", () => {
    expect(vehicleMetaDescription(WRANGLER)).toContain("Financing available.");
    // Production: the 2010 Odyssey's Autofunds comment is "CASH DEAL ONLY !."
    for (const cashOnly of [
      { ...WRANGLER, description: "CASH DEAL ONLY !." },
      { ...WRANGLER, dealerNote: "Cash buyers only" },
      { ...WRANGLER, description: "Sold as-is. No financing on this unit." },
    ]) {
      const description = vehicleMetaDescription(cashOnly);
      expect(description).not.toMatch(/financing/i);
      expect(description).toContain("$8,987");
    }
    // A cash *price* is not a cash-only restriction.
    expect(vehicleMetaDescription({ ...WRANGLER, description: "Ask about our cash price and financing." })).toContain("Financing available.");
  });

  it("says 'call for price' instead of publishing $0", () => {
    const meta = vehicleMetadata({ ...WRANGLER, price: 0 });
    expect(meta.title).toBe("2012 Jeep Wrangler Unlimited 4WD 4dr Sport for Sale");
    expect(meta.description).toContain("Call for price");
    expect(meta.description).not.toContain("$0");
  });
});

describe("vehicle structured data", () => {
  it("publishes valid Car + Offer properties from verified specs", () => {
    const data = buildVehicleJsonLd(WRANGLER);
    expect(data).toMatchObject({
      "@type": "Car",
      name: "2012 Jeep Wrangler Unlimited 4WD 4dr Sport",
      vehicleIdentificationNumber: "1C4HJWDG3CL174156",
      sku: "MZR174156",
      driveWheelConfiguration: "https://schema.org/FourWheelDriveConfiguration",
      bodyType: "SUV",
      color: "Dozer",
      vehicleInteriorColor: "Black",
      fuelType: "Gasoline",
      vehicleEngine: { "@type": "EngineSpecification", name: "3.6L V6", fuelType: "Gasoline" },
      mileageFromOdometer: { "@type": "QuantitativeValue", value: 150215, unitCode: "SMI" },
      offers: { "@type": "Offer", price: 8987, priceCurrency: "USD", availability: "https://schema.org/InStock" },
    });
    // Contradictory transmission (feed: automatic, decoded options: 6-speed manual) is omitted.
    expect(data).not.toHaveProperty("vehicleTransmission");
    expect(String(data.description)).toContain("2012 Jeep Wrangler Unlimited");
  });

  it("contains no ratings, reviews, or properties outside the allowed Car/Offer vocabulary", () => {
    const allowed = new Set([
      "@context", "@type", "@id", "url", "name", "brand", "model", "vehicleModelDate", "itemCondition", "mileageFromOdometer",
      "vehicleIdentificationNumber", "sku", "vehicleConfiguration", "bodyType", "color", "vehicleInteriorColor",
      "vehicleTransmission", "driveWheelConfiguration", "fuelType", "seatingCapacity", "vehicleEngine", "image", "description", "offers",
    ]);
    for (const vehicle of [...allVehicles, WRANGLER]) {
      const data = buildVehicleJsonLd(vehicle);
      for (const key of Object.keys(data)) expect(allowed.has(key), key).toBe(true);
      const json = serializeJsonLd(data);
      expect(json).not.toMatch(/aggregateRating|review|ratingValue/i);
      expect(() => JSON.parse(json)).not.toThrow();
    }
  });
});

describe("sitemap inclusion", () => {
  const original = allVehicles[0].isSold;
  afterEach(() => {
    allVehicles[0].isSold = original;
  });

  it("lists in-stock vehicles with a lastModified date and drops sold ones", async () => {
    const before = (await sitemap()).map((e) => e.url);
    const url = `https://www.speedwaymotorsllc.com/inventory/${allVehicles[0].slug}`;
    expect(before).toContain(url);

    allVehicles[0].isSold = true;
    const after = (await sitemap()).map((e) => e.url);
    expect(after).not.toContain(url);
  });
});
