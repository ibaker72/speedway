import { describe, it, expect } from "vitest";
import { resolveSlug } from "@/lib/server/importVehicles";
import type { AutofundsVehicle } from "@/lib/feed/autofunds-parser";

function vehicle(overrides: Partial<AutofundsVehicle>): AutofundsVehicle {
  return {
    stockNumber: "S1",
    vin: "VIN1",
    year: 2018,
    make: "Toyota",
    model: "RAV4",
    trim: "XLE AWD (Natl)",
    condition: "used",
    price: 20000,
    mileage: 50000,
    images: [],
    features: [],
    ...overrides,
  };
}

describe("resolveSlug", () => {
  it("keeps the existing slug for a VIN already in the DB (stable URLs, no conflict)", () => {
    // Regression for the production outage: the feed's remaining RAV4 must
    // NOT regenerate the base slug owned by its sold sibling row.
    const vinToSlug = new Map([
      ["2T3RFREV5JW796806", "2018-toyota-rav4-xle-awd-natl-mzr796806"],
    ]);
    const taken = new Set(["2018-toyota-rav4-xle-awd-natl", "2018-toyota-rav4-xle-awd-natl-mzr796806"]);
    const slug = resolveSlug(vehicle({ vin: "2T3RFREV5JW796806" }), vinToSlug, taken);
    expect(slug).toBe("2018-toyota-rav4-xle-awd-natl-mzr796806");
  });

  it("suffixes a new VIN whose generated slug is taken by any DB row (even sold ones)", () => {
    const taken = new Set(["2018-toyota-rav4-xle-awd-natl"]);
    const slug = resolveSlug(
      vehicle({ vin: "NEWVIN123", stockNumber: "MZR999" }),
      new Map(),
      taken
    );
    expect(slug).toBe("2018-toyota-rav4-xle-awd-natl-mzr999");
    expect(taken.has(slug)).toBe(true);
  });

  it("generates the plain slug when there is no conflict", () => {
    const slug = resolveSlug(vehicle({ vin: "NEWVIN123" }), new Map(), new Set());
    expect(slug).toBe("2018-toyota-rav4-xle-awd-natl");
  });

  it("dedupes two identical vehicles within the same feed", () => {
    const taken = new Set<string>();
    const a = resolveSlug(vehicle({ vin: "VINA", stockNumber: "STK1" }), new Map(), taken);
    const b = resolveSlug(vehicle({ vin: "VINB", stockNumber: "STK2" }), new Map(), taken);
    expect(a).not.toBe(b);
  });

  it("falls back to a VIN suffix when even the stock-suffixed slug is taken", () => {
    const taken = new Set([
      "2018-toyota-rav4-xle-awd-natl",
      "2018-toyota-rav4-xle-awd-natl-stk1",
    ]);
    const slug = resolveSlug(
      vehicle({ vin: "VINC", stockNumber: "STK1" }),
      new Map(),
      taken
    );
    expect(slug).toBe("2018-toyota-rav4-xle-awd-natl-stk1-vinc");
  });
});
