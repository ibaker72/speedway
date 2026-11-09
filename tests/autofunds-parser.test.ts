import { describe, it, expect } from "vitest";
import { parseAutofundsCsv } from "@/lib/feed/autofunds-parser";

const HEADER =
  "DealerID,StockNumber,VIN,Year,Make,Model,Trim,Condition,InternetSpecial,Mileage,PhotoUrls";

function csvRow(fields: Record<string, string>): string {
  const cols = HEADER.split(",");
  return cols.map((c) => `"${fields[c] ?? ""}"`).join(",");
}

function buildCsv(rows: Record<string, string>[]): string {
  return [HEADER, ...rows.map(csvRow)].join("\n");
}

const BASE = {
  DealerID: "4952",
  StockNumber: "A123",
  VIN: "2HGFE1E50RH473641",
  Year: "2024",
  Make: "Honda",
  Model: "Civic Si",
  Trim: "Manual",
  Condition: "Used",
  InternetSpecial: "31998",
  Mileage: "12000",
};

describe("parseAutofundsCsv photo handling", () => {
  it("splits pipe-delimited photos, keeps order, first is primary", () => {
    const urls = [
      "https://images.autofunds.net/InventoryImages/2026/04/29/a.jpg",
      "https://images.autofunds.net/InventoryImages/2026/04/29/b.jpg",
      "https://images.autofunds.net/InventoryImages/2026/04/29/c.jpg",
    ];
    const [v] = parseAutofundsCsv(buildCsv([{ ...BASE, PhotoUrls: urls.join("|") }]));
    expect(v.images.map((i) => i.url)).toEqual(urls);
    expect(v.images[0].isPrimary).toBe(true);
    expect(v.images[1].isPrimary).toBe(false);
  });

  it("preserves query strings on photo URLs", () => {
    const url = "https://images.autofunds.net/a.jpg?v=1727111025337&sig=x%2Fy";
    const [v] = parseAutofundsCsv(buildCsv([{ ...BASE, PhotoUrls: url }]));
    expect(v.images[0].url).toBe(url);
  });

  it("drops malformed/blocked entries but keeps valid ones (first valid becomes primary)", () => {
    const good = "https://images.autofunds.net/InventoryImages/good.jpg";
    const photo = ["not a url", "javascript:alert(1)", "https://evil.example.com/x.jpg", ` ${good} `].join("|");
    const [v] = parseAutofundsCsv(buildCsv([{ ...BASE, PhotoUrls: photo }]));
    expect(v.images).toHaveLength(1);
    expect(v.images[0].url).toBe(good);
    expect(v.images[0].isPrimary).toBe(true);
  });

  it("rewrites legacy InvImg hosts during import", () => {
    const [v] = parseAutofundsCsv(
      buildCsv([{ ...BASE, PhotoUrls: "https://InvImg2B.autofunds.net/InventoryImages/x.jpg" }])
    );
    expect(v.images[0].url).toBe("https://images.autofunds.net/InventoryImages/x.jpg");
  });

  it("handles a vehicle with 41 valid photos", () => {
    const urls = Array.from(
      { length: 41 },
      (_, i) => `https://images.autofunds.net/InventoryImages/2026/04/29/photo_${i + 1}.jpg`
    );
    const [v] = parseAutofundsCsv(buildCsv([{ ...BASE, PhotoUrls: urls.join("|") }]));
    expect(v.images).toHaveLength(41);
    expect(v.images.map((i) => i.url)).toEqual(urls);
    expect(v.images.filter((i) => i.isPrimary)).toHaveLength(1);
  });

  it("yields an empty image list when PhotoUrls is empty", () => {
    const [v] = parseAutofundsCsv(buildCsv([{ ...BASE, PhotoUrls: "" }]));
    expect(v.images).toEqual([]);
  });
});

describe("parseAutofundsCsv spec cells", () => {
  const SPEC_HEADER = "VIN,Year,Make,Model,Trim,DriveTrain,FuelType,Body,Transmission,Comments,Options";
  const row = (cells: string[]) => [SPEC_HEADER, cells.map((c) => `"${c}"`).join(",")].join("\n");

  it("leaves a blank DriveTrain undefined instead of defaulting to FWD", () => {
    const [v] = parseAutofundsCsv(row(["1C4HJWDG3CL174156", "2012", "Jeep", "Wrangler Unlimited", "4WD 4dr Sport", "", "Gasoline Fuel", "Sport Utility", "Automatic", "", "Four Wheel Drive"]));
    expect(v.drivetrain).toBeUndefined();
    expect(v.feed?.Trim).toBe("4WD 4dr Sport");
  });

  it("normalizes verbose drivetrain spellings that used to fall through to FWD", () => {
    for (const [raw, expected] of [
      ["4x4/4-wheel drive", "4WD"],
      ["Four-Wheel Drive", "4WD"],
      ["All-Wheel Drive", "AWD"],
      ["Rear Wheel Drive", "RWD"],
      ["2WD", undefined],
    ] as const) {
      const [v] = parseAutofundsCsv(row(["VIN00000000000001", "2020", "Make", "Model", "", raw, "", "", "", "", ""]));
      expect(v.drivetrain).toBe(expected);
    }
  });

  it("parses hybrids as hybrid, not electric, and keeps unknown body text undefined", () => {
    const [v] = parseAutofundsCsv(row(["VIN00000000000001", "2020", "Honda", "CR-V Hybrid", "EX-L", "AWD", "Gas/Electric Hybrid", "Tandem axle", "Automatic", "", ""]));
    expect(v.fuelType).toBe("Hybrid");
    expect(v.bodyType).toBeUndefined();
  });

  it("imports the Comments column as the description, keeping the raw cell", () => {
    const comments = "Line one, with a comma.\nLine two.";
    const [v] = parseAutofundsCsv(row(["VIN00000000000001", "2020", "Make", "Model", "", "", "", "", "", comments, ""]));
    expect(v.description).toBe(comments);
    expect(v.feed?.Comments).toBe(comments);
    expect(v.feed).not.toHaveProperty("Options");
  });
});
