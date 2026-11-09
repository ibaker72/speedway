import type { DescriptionFacts } from "@/lib/descriptions/facts";
import { bodyTypeLabel } from "@/lib/inventory/specs";

/**
 * Deterministic, no-cost vehicle descriptions built only from verified facts.
 *
 * - Every clause is conditional on a fact being present; nothing is filled in.
 * - It never states condition, history, ownership, warranty, certification,
 *   inspection, or financing approval — those aren't in the facts at all.
 * - Sentence variants are picked from a hash of the VIN, so a vehicle's text
 *   is stable from sync to sync while similar vehicles read differently.
 *
 * Bump TEMPLATE_VERSION whenever the output for the same facts changes; stored
 * descriptions record the version and are regenerated on the next sync.
 */
export const TEMPLATE_VERSION = "template-v1";

/** FNV-1a — tiny, deterministic, and identical in Node and the browser. */
function stableHash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function pick<T>(options: readonly T[], seed: number, salt: number): T {
  return options[(seed + salt * 7919) % options.length];
}

/** "a"/"an" for the spoken form of the next word ("an 8-speed", "an SUV", "a 3.6L"). */
export function article(next: string): "a" | "an" {
  const word = next.trim().toLowerCase();
  if (/^(8|11|18|80)/.test(word)) return "an";
  // Initialisms read letter by letter.
  if (/^(suv|fwd|rwd|awd|hvac)\b/.test(word)) return "an";
  if (/^(uni|use|one|eu)/.test(word)) return "a";
  return /^[aeiou]/.test(word) ? "an" : "a";
}

function formatMiles(miles: number): string {
  return new Intl.NumberFormat("en-US").format(miles);
}

function list(items: string[]): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function vehicleName(f: DescriptionFacts): string {
  return [f.year, f.make, f.model, f.trim].filter(Boolean).join(" ");
}

function bodyPhrase(f: DescriptionFacts): string | null {
  if (!f.bodyType) return null;
  if (f.bodyType === "van" && /\bcargo\b/i.test(f.model)) return "cargo van";
  if (f.bodyType === "suv") return "SUV";
  return bodyTypeLabel(f.bodyType).toLowerCase();
}

function enginePhrase(f: DescriptionFacts): string | null {
  if (!f.engine) return null;
  if (f.engineIsElectric) return "an electric motor";
  // "3.6L V6" → "a 3.6L V6 engine"; "Turbocharged 2.0L 4-Cylinder" → "a turbocharged 2.0L 4-cylinder engine".
  const text = f.engine
    .replace(/^Turbocharged\b/, "turbocharged")
    .replace(/-Cylinder\b/, "-cylinder")
    .replace(/\bInline-/, "inline-")
    .replace(/\bFlat-/, "flat-");
  const withNoun = /\b(engine|motor)\b/i.test(text) ? text : `${text} engine`;
  return `${article(withNoun)} ${withNoun}`;
}

function transmissionPhrase(f: DescriptionFacts): string | null {
  const t = f.transmission;
  if (!t) return null;
  if (t.type === "CVT") return "a continuously variable automatic transmission (CVT)";
  const kind = t.type.toLowerCase();
  const text = t.speeds ? `${t.speeds}-speed ${kind} transmission` : `${kind} transmission`;
  return `${article(text)} ${text}`;
}

const DRIVE_PHRASE: Record<NonNullable<DescriptionFacts["drivetrain"]>, string> = {
  "4WD": "four-wheel drive (4WD)",
  AWD: "all-wheel drive (AWD)",
  FWD: "front-wheel drive (FWD)",
  RWD: "rear-wheel drive (RWD)",
};

function identitySentence(f: DescriptionFacts, seed: number): string {
  const name = vehicleName(f);
  const body = bodyPhrase(f);
  const miles = f.mileage ? formatMiles(f.mileage) : null;
  if (body && miles) {
    return pick(
      [
        `This ${name} is ${article(body)} ${body} with ${miles} miles on the odometer.`,
        `This ${name} is ${article(body)} ${body} showing ${miles} miles.`,
        `This ${body} is a ${name} with ${miles} miles.`,
      ],
      seed,
      1
    );
  }
  if (miles) return `This ${name} has ${miles} miles on the odometer.`;
  if (body) return `This ${name} is ${article(body)} ${body}.`;
  return `This ${name} is part of the ${f.dealer.name} inventory in ${f.dealer.city}, ${f.dealer.state}.`;
}

function colorSentence(f: DescriptionFacts, seed: number): string | null {
  const ext = f.exteriorColor;
  const int = f.interiorColor;
  if (ext && int) {
    return pick(
      [
        `It's finished in ${ext} with ${article(int)} ${int} interior.`,
        `The exterior is ${ext}, paired with ${article(int)} ${int} interior.`,
        `${ext} paint is matched with ${article(int)} ${int} interior.`,
      ],
      seed,
      2
    );
  }
  if (ext) return `It's finished in ${ext}.`;
  if (int) return `Inside, it has ${article(int)} ${int} interior.`;
  return null;
}

function powertrainSentence(f: DescriptionFacts, seed: number): string | null {
  const engine = enginePhrase(f);
  const trans = transmissionPhrase(f);
  const drive = f.drivetrain ? DRIVE_PHRASE[f.drivetrain] : null;
  if (engine && trans) {
    const lead = pick(["Power comes from", "It's powered by", "Under the hood is"], seed, 3);
    const joiner = lead === "Under the hood is" ? "matched to" : "paired with";
    return `${lead} ${engine} ${joiner} ${trans}${drive ? `, with ${drive}` : ""}.`;
  }
  if (engine) return `It's powered by ${engine}${drive ? ` with ${drive}` : ""}.`;
  if (trans) return `It uses ${trans}${drive ? ` and ${drive}` : ""}.`;
  if (drive) return `It has ${drive}.`;
  return null;
}

function fuelSentence(f: DescriptionFacts): string | null {
  switch (f.fuel?.type) {
    case "Hybrid":
      return f.fuel.mild
        ? "A mild-hybrid system assists the gasoline engine."
        : "As a gas-electric hybrid, it pairs a gasoline engine with an electric motor.";
    case "Plug-In Hybrid":
      return "As a plug-in hybrid, it can charge from an outlet and also runs on gasoline.";
    case "Electric":
      return "It's fully electric, so it runs without gasoline.";
    case "Diesel":
      return "It runs on diesel fuel.";
    case "Flex Fuel":
      return "It's flex-fuel capable, so it can run on gasoline or E85.";
    default:
      return null;
  }
}

function tractionSentence(f: DescriptionFacts): string | null {
  if (f.drivetrain === "4WD") return "Four-wheel drive adds traction for snow, mud, and unpaved roads.";
  if (f.drivetrain === "AWD") return "All-wheel drive adds traction in rain and snow.";
  return null;
}

function equipmentSentence(f: DescriptionFacts, seed: number): string | null {
  const items = f.highlights.slice(0, 6);
  if (items.length === 0) return null;
  const lead = pick(
    [
      "Equipment listed for this vehicle includes",
      `Listed features on this ${f.model} include`,
      "The equipment list includes",
    ],
    seed,
    4
  );
  return `${lead} ${list(items)}.`;
}

function practicalSentence(f: DescriptionFacts): string | null {
  if (f.bodyType === "van" && /\bcargo\b/i.test(f.model)) {
    return "The cargo-van layout suits trades, deliveries, and service work.";
  }
  if (!f.seating || f.bodyType === "truck") return null;
  return f.seating >= 7 ? `It seats up to ${f.seating}.` : f.seating >= 2 ? `It seats ${f.seating}.` : null;
}

function closingSentence(f: DescriptionFacts, seed: number): string {
  const where = `${f.dealer.name} in ${f.dealer.city}, ${f.dealer.state}`;
  const shipping = f.dealer.shipping;
  return pick(
    [
      `Contact ${where} to check availability, schedule a test drive, or ask about financing${shipping ? " and nationwide shipping" : ""}.`,
      `Questions about this ${f.model}? ${where} can confirm availability, set up a test drive, and go over financing${shipping ? " and shipping" : ""} options.`,
      `Reach out to ${where} to confirm availability, arrange a test drive, or ask about financing options${shipping ? " and shipping to your area" : ""}.`,
    ],
    seed,
    5
  );
}

/**
 * Builds a 2–3 paragraph description. Paragraphs are separated by a blank
 * line so they survive storage as plain text.
 */
export function generateTemplateDescription(f: DescriptionFacts): string {
  const seed = stableHash(f.vin || vehicleName(f));
  const intro = [identitySentence(f, seed), colorSentence(f, seed)];
  const powertrain = [powertrainSentence(f, seed), fuelSentence(f), tractionSentence(f)];
  const features = [equipmentSentence(f, seed), practicalSentence(f)];
  const paragraphs = [intro, powertrain, features]
    .map((sentences) => sentences.filter(Boolean).join(" "))
    .filter(Boolean);
  // The closing joins the last paragraph so short descriptions stay compact.
  const closing = closingSentence(f, seed);
  if (paragraphs.length === 1) paragraphs.push(closing);
  else paragraphs[paragraphs.length - 1] += ` ${closing}`;
  return paragraphs.join("\n\n");
}
