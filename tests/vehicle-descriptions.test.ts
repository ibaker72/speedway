import { describe, it, expect, vi } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { allVehicles } from "@/lib/data/vehicles-full";
import { assessDealerDescription, dealerNoteFrom, descriptionParagraphs } from "@/lib/descriptions/assess";
import { createAnthropicEnhancer } from "@/lib/descriptions/ai";
import { buildDescriptionFacts, type DescriptionFacts } from "@/lib/descriptions/facts";
import { descriptionInputHash, descriptionTextHash, planDescription, type StoredDescriptionState } from "@/lib/descriptions/plan";
import { TEMPLATE_VERSION, generateTemplateDescription } from "@/lib/descriptions/template";
import { validateGeneratedDescription } from "@/lib/descriptions/validate";
import { normalizeVehicleSpecs, type SpecInput } from "@/lib/inventory/specs";

const DEALER = { name: "Speedway Motors", city: "Paterson", state: "NJ", shipping: true };

function factsFor(input: SpecInput): DescriptionFacts {
  return buildDescriptionFacts(input, normalizeVehicleSpecs(input), DEALER);
}

const JEEP: SpecInput = {
  year: 2012,
  make: "Jeep",
  model: "Wrangler Unlimited",
  trim: "4WD 4dr Sport",
  vin: "1C4HJWDG3CL174156",
  mileage: 150215,
  drivetrain: "",
  transmission: "Automatic",
  fuelType: "Gasoline Fuel",
  engine: "3.6 V6 Cylinder Engine",
  cylinders: 6,
  body: "Sport Utility",
  exteriorColor: "Dozer",
  interiorColor: "Black Interior",
  features: ["Four Wheel Drive", "Gasoline Fuel", "Bluetooth", "Fog Lamps", "Cruise Control", "Tow Hooks"],
};

const SPARSE: SpecInput = { year: 2010, make: "Honda", model: "Odyssey", vin: "5FNRL3H43AB092425" };

function localFacts() {
  return allVehicles.map((v) =>
    factsFor({
      year: v.year, make: v.make, model: v.model, trim: v.trim, vin: v.vin, mileage: v.mileage, drivetrain: v.drivetrain,
      transmission: v.transmission, fuelType: v.fuelType, engine: v.engine, cylinders: v.cylinders, body: v.bodyType,
      exteriorColor: v.exteriorColor, interiorColor: v.interiorColor, seating: v.passengers, features: v.features,
    })
  );
}

describe("template descriptions", () => {
  it("describes the 2012 Wrangler from verified data only", () => {
    const text = generateTemplateDescription(factsFor(JEEP));
    expect(text).toContain("2012 Jeep Wrangler Unlimited 4WD 4dr Sport");
    expect(text).toContain("150,215 miles");
    expect(text).toMatch(/SUV/);
    expect(text).toContain("Dozer");
    expect(text).toContain("Black interior");
    expect(text).toContain("3.6L V6 engine");
    expect(text).toContain("automatic transmission");
    expect(text).toContain("four-wheel drive (4WD)");
    expect(text).toContain("Bluetooth");
    expect(text).toContain("Speedway Motors in Paterson, NJ");
    expect(text.split("\n\n").length).toBeGreaterThanOrEqual(2);
    expect(validateGeneratedDescription(text, factsFor(JEEP))).toEqual({ ok: true, problems: [] });
  });

  it("omits every unavailable field instead of guessing", () => {
    const text = generateTemplateDescription(factsFor(SPARSE));
    expect(text).toContain("2010 Honda Odyssey");
    for (const absent of ["miles", "powered", "transmission", "wheel drive", "finished in", "interior", "Equipment"]) {
      expect(text).not.toContain(absent);
    }
    expect(validateGeneratedDescription(text, factsFor(SPARSE)).ok).toBe(true);
  });

  it("is deterministic for the same facts", () => {
    expect(generateTemplateDescription(factsFor(JEEP))).toBe(generateTemplateDescription(factsFor(JEEP)));
  });

  it("never states condition, history, ownership, warranty, certification, financing approval, or price", () => {
    const matrix = [...localFacts(), factsFor(JEEP), factsFor(SPARSE)];
    for (const facts of matrix) {
      const text = generateTemplateDescription(facts);
      const check = validateGeneratedDescription(text, facts);
      expect(check.problems, `${facts.year} ${facts.make} ${facts.model}: ${text}`).toEqual([]);
    }
  });

  it("produces unique, varied text across the inventory", () => {
    const texts = localFacts().map(generateTemplateDescription);
    expect(new Set(texts).size).toBe(texts.length);
    const openings = new Set(texts.map((t) => t.split(" ").slice(0, 2).join(" ") + "|" + t.split(/[.!?]/)[0].split(" ").slice(-4).join(" ")));
    expect(openings.size).toBeGreaterThan(2);
    const closings = new Set(texts.map((t) => t.split(/(?<=\.)\s/).pop()?.slice(0, 12)));
    expect(closings.size).toBeGreaterThan(1);
  });

  it("does not keyword-stuff the make and model", () => {
    for (const facts of localFacts()) {
      const text = generateTemplateDescription(facts);
      const fullName = `${facts.make} ${facts.model}`;
      expect(text.split(fullName).length - 1).toBeLessThanOrEqual(1);
    }
  });

  it("uses the hybrid, diesel, and flex-fuel facts it is given", () => {
    const hybrid = generateTemplateDescription(factsFor({ ...SPARSE, fuelType: "Gas/Electric Hybrid" }));
    expect(hybrid).toContain("gas-electric hybrid");
    const mild = generateTemplateDescription(factsFor({ ...SPARSE, fuelType: "Gasoline/Mild Electric Hybrid" }));
    expect(mild).toContain("mild-hybrid");
    const flex = factsFor({ ...SPARSE, fuelType: "Gasoline", features: ["Flex Fuel Capability"] });
    expect(validateGeneratedDescription(generateTemplateDescription(flex), flex).ok).toBe(true);
  });
});

describe("validator", () => {
  it("rejects invented claims and numbers", () => {
    const facts = factsFor(JEEP);
    const base = generateTemplateDescription(facts);
    expect(validateGeneratedDescription(`${base} One owner, clean Carfax.`, facts).problems).toEqual(
      expect.arrayContaining(["vehicle history", "ownership history"])
    );
    expect(validateGeneratedDescription(`${base} It gets 24 mpg.`, facts).problems).toContain("unsupported numbers: 24");
    expect(validateGeneratedDescription(`${base} Comes with a warranty.`, facts).problems).toContain("warranty or certification");
    expect(validateGeneratedDescription(`${base} Guaranteed approval for all credit!`, facts).problems).toContain("financing approval");
    expect(validateGeneratedDescription(`${base} Only $8,987!`, facts).problems).toContain("price");
  });
});

describe("dealer description usability", () => {
  it("rejects slogans, placeholders, and text copied from another VIN", () => {
    expect(assessDealerDescription("CASH DEAL ONLY !.")).toMatchObject({ usable: false, reason: "too-short" });
    expect(assessDealerDescription("THE PRICE YOU SEE IS THE PRICE YOU PAY!.")).toMatchObject({ usable: false, reason: "too-short" });
    expect(assessDealerDescription("N/A")).toMatchObject({ usable: false, reason: "placeholder" });
    expect(assessDealerDescription("   ")).toMatchObject({ usable: false, reason: "empty" });
    const copied =
      "2021 Ram ProMaster Cargo Van 2500 High Roof. VIN: 3C6LRVDG0ME570219. Spacious and versatile commercial cargo van " +
      "with plenty of room for tools, equipment, and inventory for contractors and delivery companies.";
    expect(assessDealerDescription(copied, { vin: "3C6LRVDG0ME570219" }).usable).toBe(true);
    expect(assessDealerDescription(copied, { vin: "1FTBR1Y82SKB03927" })).toMatchObject({ usable: false, reason: "mentions-other-vin" });
  });

  it("keeps short dealer notes visible when the overview comes from elsewhere", () => {
    expect(dealerNoteFrom("CASH DEAL ONLY !.", "generated")).toBe("CASH DEAL ONLY !.");
    expect(dealerNoteFrom("N/A", "generated")).toBeNull();
    expect(dealerNoteFrom("CASH DEAL ONLY !.", "feed")).toBeNull();
  });

  it("splits stored text into paragraphs, including Autofunds' flattened line breaks", () => {
    expect(descriptionParagraphs("One.\n\nTwo.\nThree.")).toEqual(["One.", "Two.", "Three."]);
    expect(descriptionParagraphs("2021 Ram ProMaster Cargo Van  2500 High Roof  Stock #: X  This van is clean.")).toEqual([
      "2021 Ram ProMaster Cargo Van 2500 High Roof",
      "Stock #: X",
      "This van is clean.",
    ]);
  });
});

describe("description provenance", () => {
  const facts = factsFor(JEEP);
  const LONG = "A long dealer description. ".repeat(10).trim();
  const empty: StoredDescriptionState = {
    description: null, description_source: null, description_hash: null, description_input_hash: null,
    description_generator: null, generated_description: null,
  };

  it("missing description → generated, with source-data hash and generator version", () => {
    const plan = planDescription({ existing: null, feedDescription: null, facts });
    expect(plan).toMatchObject({ description_source: "generated", description_generator: TEMPLATE_VERSION, regenerated: true });
    expect(plan.description_input_hash).toBe(descriptionInputHash(facts));
  });

  it("usable feed comments win over generation", () => {
    const plan = planDescription({ existing: null, feedDescription: LONG, facts });
    expect(plan).toMatchObject({ description_source: "feed", description: LONG, regenerated: false });
  });

  it("a manual edit (text no longer matches the published hash) is preserved", () => {
    const published = planDescription({ existing: null, feedDescription: null, facts });
    const existing: StoredDescriptionState = { ...empty, ...published, description: "Hand-written by staff." };
    const plan = planDescription({ existing, feedDescription: LONG, facts });
    expect(plan).toMatchObject({ description_source: "manual", description: "Hand-written by staff.", manualDetected: true });
  });

  it("legacy rows: text equal to the old feed copy is not mistaken for a manual edit", () => {
    const existing: StoredDescriptionState = { ...empty, description: LONG, legacy_feed_description: LONG };
    expect(planDescription({ existing, feedDescription: LONG, facts }).description_source).toBe("feed");
    const edited: StoredDescriptionState = { ...empty, description: "Typed by staff in Supabase.", legacy_feed_description: LONG };
    expect(planDescription({ existing: edited, feedDescription: LONG, facts }).description_source).toBe("manual");
  });

  it("reuses cached text until the facts change, then regenerates", () => {
    const first = planDescription({ existing: null, feedDescription: null, facts });
    const cached = planDescription({ existing: { ...empty, ...first }, feedDescription: null, facts });
    expect(cached.regenerated).toBe(false);

    const changed = factsFor({ ...JEEP, mileage: 151002 });
    const regenerated = planDescription({ existing: { ...empty, ...first }, feedDescription: null, facts: changed });
    expect(regenerated.regenerated).toBe(true);
    expect(regenerated.description).toContain("151,002");
  });

  it("keeps a cached AI rewrite while the facts are unchanged", () => {
    const first = planDescription({ existing: null, feedDescription: null, facts });
    const ai = { ...first, generated_description: "AI text", description: "AI text", description_hash: descriptionTextHash("AI text"), description_generator: `ai:claude-opus-5-5:${TEMPLATE_VERSION}` };
    const plan = planDescription({ existing: { ...empty, ...ai }, feedDescription: null, facts });
    expect(plan).toMatchObject({ description: "AI text", regenerated: false });
  });

  it("regenerates when the template version is outdated", () => {
    const first = planDescription({ existing: null, feedDescription: null, facts });
    const old = { ...empty, ...first, description_generator: "template-v0" };
    expect(planDescription({ existing: old, feedDescription: null, facts }).regenerated).toBe(true);
  });
});

describe("optional AI enhancement", () => {
  const facts = factsFor(JEEP);
  const template = generateTemplateDescription(facts);
  function fakeClient(text: string, stop_reason = "end_turn") {
    const create = vi.fn().mockResolvedValue({
      stop_reason,
      content: [{ type: "text", text }],
      usage: { input_tokens: 400, output_tokens: 150 },
    });
    return { client: { beta: { messages: { create } } } as never, create };
  }

  it("accepts a rewrite that passes validation and tracks usage", async () => {
    const rewrite =
      "Looking for a capable four-door? This 2012 Jeep Wrangler Unlimited 4WD 4dr Sport has 150,215 miles and wears Dozer paint over a Black interior.\n\n" +
      "A 3.6L V6 engine and an automatic transmission send power through four-wheel drive (4WD). Listed equipment includes Bluetooth and fog lamps.\n\n" +
      "Contact Speedway Motors in Paterson, NJ to check availability or schedule a test drive.";
    const { client, create } = fakeClient(rewrite);
    const enhancer = createAnthropicEnhancer({ client, maxRequests: 5 });
    await expect(enhancer.enhance(facts, template)).resolves.toBe(rewrite);
    expect(enhancer.usage).toMatchObject({ requests: 1, inputTokens: 400, outputTokens: 150, rejected: 0 });
    expect(create.mock.calls[0][0]).toMatchObject({ model: "claude-opus-5-5", fallbacks: "default", output_config: { effort: "low" } });
  });

  it("rejects rewrites that add claims, and refusals", async () => {
    const { client } = fakeClient(`${template} One owner and a clean history.`);
    const enhancer = createAnthropicEnhancer({ client, maxRequests: 5 });
    await expect(enhancer.enhance(facts, template)).resolves.toBeNull();
    expect(enhancer.usage.rejected).toBe(1);

    const refused = createAnthropicEnhancer({ client: fakeClient(template, "refusal").client, maxRequests: 5 });
    await expect(refused.enhance(facts, template)).resolves.toBeNull();
  });

  it("enforces the per-run request cap", async () => {
    const { client, create } = fakeClient(template);
    const enhancer = createAnthropicEnhancer({ client, maxRequests: 1 });
    await enhancer.enhance(facts, template);
    await expect(enhancer.enhance(facts, template)).resolves.toBeNull();
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("is never imported by pages, components, API routes, or the sync", () => {
    const root = path.resolve(__dirname, "..");
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const full = path.join(dir, name);
        if (statSync(full).isDirectory()) walk(full);
        else if (/\.(ts|tsx)$/.test(name)) {
          const source = readFileSync(full, "utf8");
          if (/^import (?!type )[^;]*["']@\/lib\/descriptions\/ai["']/m.test(source)) offenders.push(path.relative(root, full));
        }
      }
    };
    for (const dir of ["app", "components", "lib"]) walk(path.join(root, dir));
    expect(offenders).toEqual([]);
  });
});
