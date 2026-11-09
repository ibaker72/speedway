import { describe, it, expect } from "vitest";
import {
  bodyTypeFromModel,
  cleanColor,
  displayTrim,
  drivetrainFromOptions,
  normalizeMileage,
  normalizeVehicleSpecs,
  normalizeVin,
  parseBodyType,
  parseDrivetrain,
  parseEngine,
  parseFuel,
  parseTransmission,
  transmissionFromOptions,
  vinCheckDigitValid,
  type SpecInput,
} from "@/lib/inventory/specs";
import { specInputFromRow } from "@/lib/inventory/spec-input";

const base: SpecInput = { year: 2020, make: "Honda", model: "Accord", features: [] };

// Options as they appear on the production 2012 Wrangler row (abridged).
const WRANGLER_OPTIONS = [
  "ABS",
  "4-Wheel Disc Brakes",
  "Four Wheel Drive",
  "Gasoline Fuel",
  "Rollover Protection Bars",
  "V6 Cylinder Engine",
  "Command-Trac shift-on-the-fly 4WD system",
];

describe("drivetrain normalization", () => {
  it("reads explicit values in many spellings", () => {
    expect(parseDrivetrain("4x4")).toBe("4WD");
    expect(parseDrivetrain("Four-Wheel Drive")).toBe("4WD");
    expect(parseDrivetrain("4 Wheel Drive")).toBe("4WD");
    expect(parseDrivetrain("Part-Time 4WD")).toBe("4WD");
    expect(parseDrivetrain("All Wheel Drive")).toBe("AWD");
    expect(parseDrivetrain("SH-AWD")).toBe("AWD");
    expect(parseDrivetrain("330i xDrive Sedan")).toBe("AWD");
    expect(parseDrivetrain("45 TFSI quattro")).toBe("AWD");
    expect(parseDrivetrain("Front Wheel Drive")).toBe("FWD");
    expect(parseDrivetrain("rear-wheel drive")).toBe("RWD");
  });

  it("returns null for blank, ambiguous, or unknown text instead of defaulting to FWD", () => {
    expect(parseDrivetrain("")).toBeNull();
    expect(parseDrivetrain(null)).toBeNull();
    expect(parseDrivetrain("2WD")).toBeNull();
    expect(parseDrivetrain("4x2")).toBeNull();
    expect(parseDrivetrain("Sport")).toBeNull();
    expect(parseDrivetrain("4WD/AWD")).toBeNull();
  });

  it("2012 Jeep Wrangler Unlimited Sport (1C4HJWDG3CL174156): blank feed cell resolves to 4WD from trim and options", () => {
    const specs = normalizeVehicleSpecs({
      year: 2012,
      make: "Jeep",
      model: "Wrangler Unlimited",
      trim: "4WD 4dr Sport",
      drivetrain: "",
      vin: "1C4HJWDG3CL174156",
      features: WRANGLER_OPTIONS,
    });
    expect(specs.drivetrain).toBe("4WD");
    expect(specs.sources.drivetrain).toBe("trim");
    expect(specs.conflicts).toEqual([]);
  });

  it("does not infer a drivetrain when no source states one", () => {
    const specs = normalizeVehicleSpecs({ ...base, model: "Odyssey", trim: "5dr EX", drivetrain: "" });
    expect(specs.drivetrain).toBeNull();
  });

  it("marks contradictory sources unavailable and records the conflict", () => {
    const specs = normalizeVehicleSpecs({ ...base, trim: "AWD Touring", drivetrain: "FWD" });
    expect(specs.drivetrain).toBeNull();
    expect(specs.conflicts).toEqual([
      { field: "drivetrain", values: [{ source: "feed", value: "FWD" }, { source: "trim", value: "AWD" }] },
    ]);
  });

  it("ignores conditional VIN-decoded option text describing other trims", () => {
    expect(
      drivetrainFromOptions([
        "GVWR, 7300 lbs. (3311 kg) (Standard on 4WD models.)",
        "Traction Select FWD models feature Normal, Snow, Sport and Trailer/Tow (if equipped)",
        "Hill Descent Control (4WD model only.)",
        "All Wheel Drive",
      ])
    ).toBe("AWD");
    expect(drivetrainFromOptions(["4-Wheel Disc Brakes", "4-Wheel ABS"])).toBeNull();
    expect(drivetrainFromOptions(["Front Wheel Drive", "Four Wheel Drive"])).toBeNull();
  });
});

describe("transmission normalization", () => {
  it("parses common spellings", () => {
    expect(parseTransmission("Automatic")).toEqual({ type: "Automatic", speeds: null });
    expect(parseTransmission("8-Speed Automatic")).toEqual({ type: "Automatic", speeds: 8 });
    expect(parseTransmission("6 Spd Manual")).toEqual({ type: "Manual", speeds: 6 });
    expect(parseTransmission("CVT")).toEqual({ type: "CVT", speeds: null });
    expect(parseTransmission("7-Speed Automatic w/manual shift mode")).toEqual({ type: "Automatic", speeds: 7 });
    expect(parseTransmission("")).toBeNull();
  });

  it("reads options without mistaking manual shift modes for manual gearboxes", () => {
    expect(
      transmissionFromOptions([
        "Transmission: Lineartronic CVT -inc: 7-speed manual shift mode, steering wheel paddle-shift control switches",
        "CVT Transmission",
      ])
    ).toEqual({ type: "CVT", speeds: null });
    expect(
      transmissionFromOptions(["7-Speed A/T", "Transmission: 7-Speed Automatic w/Overdrive -inc: manual shift mode"])
    ).toEqual({ type: "Automatic", speeds: 7 });
    expect(transmissionFromOptions(["Transmission: 6-Speed Manual Tremec"])).toEqual({ type: "Manual", speeds: 6 });
    expect(transmissionFromOptions(["6-Speed M/T", "8-Speed A/T"])).toBeNull();
  });

  it("2020 Civic Si Coupe: feed says Automatic but trim and options say manual → unavailable", () => {
    const specs = normalizeVehicleSpecs({
      year: 2020,
      make: "Honda",
      model: "Civic Si Coupe",
      trim: "Manual",
      transmission: "Automatic",
      features: ["6-Speed M/T", "Transmission: 6-Speed Manual -inc: helical limited-slip differential"],
    });
    expect(specs.transmission).toBeNull();
    expect(specs.conflicts.map((c) => c.field)).toContain("transmission");
  });

  it("enriches an agreeing feed value with the speed count from options", () => {
    const specs = normalizeVehicleSpecs({ ...base, transmission: "Automatic", features: ["10-Speed A/T"] });
    expect(specs.transmission).toEqual({ type: "Automatic", speeds: 10, label: "10-Speed Automatic" });
  });

  it("treats a CVT as compatible with an Automatic feed value", () => {
    const specs = normalizeVehicleSpecs({ ...base, transmission: "Automatic", features: ["CVT Transmission"] });
    expect(specs.transmission?.label).toBe("Automatic (CVT)");
    expect(specs.conflicts).toEqual([]);
  });

  it("does not invent a transmission when the feed cell is blank and nothing else says", () => {
    expect(normalizeVehicleSpecs({ ...base, transmission: "" }).transmission).toBeNull();
  });
});

describe("fuel normalization", () => {
  it("checks hybrid before electric (the old parser turned hybrids into electric)", () => {
    expect(parseFuel("Gas/Electric Hybrid")).toEqual({ type: "Hybrid", mild: false });
    expect(parseFuel("Gasoline/Mild Electric Hybrid")).toEqual({ type: "Hybrid", mild: true });
    expect(parseFuel("Plug-In Hybrid")).toEqual({ type: "Plug-In Hybrid", mild: false });
    expect(parseFuel("Electric")).toEqual({ type: "Electric", mild: false });
    expect(parseFuel("Gasoline Fuel")).toEqual({ type: "Gasoline", mild: false });
    expect(parseFuel("Diesel Fuel")).toEqual({ type: "Diesel", mild: false });
    expect(parseFuel("Flex Fuel")).toEqual({ type: "Flex Fuel", mild: false });
    expect(parseFuel("Compressed Natural Gas")).toBeNull();
    expect(parseFuel("")).toBeNull();
  });

  it("2021 GMC Yukon Denali: stored diesel contradicts 'Gasoline Fuel' option → unavailable", () => {
    const specs = normalizeVehicleSpecs({ ...base, make: "GMC", model: "Yukon", fuelType: "diesel", features: ["Gasoline Fuel"] });
    expect(specs.fuel).toBeNull();
    expect(specs.conflicts[0]).toMatchObject({ field: "fuel" });
  });

  it("a piston engine contradicts an 'electric' value (legacy rows for gas and hybrid cars)", () => {
    const specs = normalizeVehicleSpecs({ ...base, make: "Audi", model: "A5 Coupe", fuelType: "electric", engine: "2 Liter 4 Cylinder Engine", cylinders: 4 });
    expect(specs.fuel).toBeNull();
    expect(specs.conflicts.find((c) => c.field === "fuel")?.values[1]).toEqual({ source: "engine", value: "2.0L 4-Cylinder" });
  });

  it("labels mild hybrids and flex-fuel capability from options", () => {
    expect(normalizeVehicleSpecs({ ...base, fuelType: "Hybrid", features: ["Gasoline/Mild Electric Hybrid"] }).fuel?.label).toBe(
      "Mild Hybrid (Gasoline)"
    );
    expect(normalizeVehicleSpecs({ ...base, fuelType: "Gasoline", features: ["Flex Fuel Capability"] }).fuel).toEqual({
      type: "Flex Fuel",
      mild: false,
      label: "Flex Fuel (Gasoline/E85)",
    });
  });

  it("leaves fuel unavailable when the feed is blank and options are silent", () => {
    expect(normalizeVehicleSpecs({ ...base, fuelType: "" }).fuel).toBeNull();
  });
});

describe("engine, body, colors, mileage, identifiers", () => {
  it("formats Autofunds engine text", () => {
    expect(parseEngine("2 4 Cylinder Engine")?.label).toBe("2.0L 4-Cylinder");
    expect(parseEngine("3.5 V6 Cylinder Engine")?.label).toBe("3.5L V6");
    expect(parseEngine("3.5 Liter V6 Cylinder Engine")?.label).toBe("3.5L V6");
    expect(parseEngine("14.9 Straight 6 Cylinder Engine")?.label).toBe("14.9L Inline-6");
    expect(parseEngine("6.8 10 Cylinder Engine")?.label).toBe("6.8L 10-Cylinder");
    expect(parseEngine("4 Cylinder Engine")?.label).toBe("4-Cylinder");
    expect(parseEngine("1.5 4 Cylinder Engine", true)?.label).toBe("Turbocharged 1.5L 4-Cylinder");
    expect(parseEngine("EcoBoost Twin Turbo")?.label).toBe("EcoBoost Twin Turbo");
    expect(parseEngine("N/A")).toBeNull();
  });

  it("flags an engine that contradicts the cylinder count", () => {
    const specs = normalizeVehicleSpecs({ ...base, engine: "3.6 V6 Cylinder Engine", cylinders: 4 });
    expect(specs.engine).toBeNull();
    expect(specs.conflicts[0].field).toBe("engine");
  });

  it("normalizes body style without defaulting unknown text to sedan", () => {
    expect(parseBodyType("4 Door Sedan")).toBe("sedan");
    expect(parseBodyType("Sport Utility")).toBe("suv");
    expect(parseBodyType("2dr Hatchback")).toBe("hatchback");
    expect(parseBodyType("Convertible 2 Door")).toBe("convertible");
    expect(parseBodyType("Crew Cab Pickup")).toBe("truck");
    expect(parseBodyType("Conventional Sleeper")).toBe("truck");
    expect(parseBodyType("Cargo Van")).toBe("van");
    expect(parseBodyType("Tandem axle")).toBeNull();
    expect(parseBodyType("")).toBeNull();
    // Already-normalized values round-trip.
    for (const value of ["sedan", "suv", "truck", "van", "coupe", "wagon", "convertible", "hatchback"]) {
      expect(parseBodyType(value)).toBe(value);
    }
  });

  it("prefers a body style named in the model designation", () => {
    expect(bodyTypeFromModel("Civic Hatchback")).toBe("hatchback");
    expect(bodyTypeFromModel("Transit Cargo Van")).toBe("van");
    expect(bodyTypeFromModel("Wrangler Unlimited")).toBeNull();
    expect(normalizeVehicleSpecs({ ...base, model: "Civic Hatchback", body: "wagon" }).bodyType).toBe("hatchback");
  });

  it("cleans colors and drops placeholders", () => {
    expect(cleanColor("Black Interior")).toBe("Black");
    expect(cleanColor("  Bright White   Clearcoat ")).toBe("Bright White Clearcoat");
    expect(cleanColor("JET BLACK")).toBe("Jet Black");
    expect(cleanColor("N/A")).toBeNull();
    expect(cleanColor("Other")).toBeNull();
    expect(cleanColor("")).toBeNull();
  });

  it("treats 0 or implausible mileage as unavailable", () => {
    expect(normalizeMileage(150215)).toBe(150215);
    expect(normalizeMileage("96,836")).toBe(96836);
    expect(normalizeMileage(0)).toBeNull();
    expect(normalizeMileage(null)).toBeNull();
    expect(normalizeMileage(5_000_000)).toBeNull();
  });

  it("validates VINs and their check digit", () => {
    expect(normalizeVin(" 1c4hjwdg3cl174156 ")).toBe("1C4HJWDG3CL174156");
    expect(vinCheckDigitValid("1C4HJWDG3CL174156")).toBe(true);
    expect(vinCheckDigitValid("1C4HJWDG4CL174156")).toBe(false);
    expect(normalizeVin("1C4HJWDG3CL17415")).toBeNull(); // 16 chars
    expect(normalizeVin("1C4HJWDG3CL17415O")).toBeNull(); // contains O
    expect(normalizeVin("12345", 1969)).toBe("12345");
  });

  it("cleans display trim noise", () => {
    expect(displayTrim("XLE AWD (Natl)")).toBe("XLE AWD");
    expect(displayTrim("  4WD  4dr Sport ")).toBe("4WD 4dr Sport");
  });
});

describe("stored-row adapter", () => {
  it("uses the legacy raw_data (not the defaulted columns) for rows imported by the old parser", () => {
    const input = specInputFromRow({
      vin: "1C4HJWDG3CL174156",
      year: 2012,
      make: "Jeep",
      model: "Wrangler Unlimited",
      trim: "4WD 4dr Sport",
      drivetrain: "FWD", // the importer's invented default
      transmission: "Automatic",
      fuel_type: "gasoline",
      features: WRANGLER_OPTIONS,
      raw_data: { vin: "1C4HJWDG3CL174156", transmission: "Automatic", fuelType: "gasoline", engine: "3.6 V6 Cylinder Engine", cylinders: 6 },
    });
    expect(input.drivetrain).toBeNull();
    const specs = normalizeVehicleSpecs(input);
    expect(specs.drivetrain).toBe("4WD");
    expect(specs.engine?.label).toBe("3.6L V6");
    expect(specs.fuel?.type).toBe("Gasoline");
  });

  it("prefers raw CSV cells when the row was imported by the current parser", () => {
    const input = specInputFromRow({
      vin: "X",
      year: 2020,
      make: "Honda",
      model: "CR-V Hybrid",
      fuel_type: "Hybrid",
      raw_data: { vin: "X", feed: { FuelType: "Gas/Electric Hybrid", DriveTrain: "AWD" } },
    });
    expect(input.fuelType).toBe("Gas/Electric Hybrid");
    expect(input.drivetrain).toBe("AWD");
  });
});
