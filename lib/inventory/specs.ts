/**
 * Vehicle specification normalization.
 *
 * Autofunds sends one free-text cell per spec (DriveTrain, Transmission,
 * FuelType, Body, EngineDescription) plus a long, VIN-decoded "Options" list.
 * The feed cells are sometimes blank (the 2012 Wrangler's DriveTrain) or
 * defaulted (Transmission is "Automatic" for every vehicle, including a Civic
 * Si whose trim says "Manual"). Earlier code filled gaps with guesses
 * ("FWD", "Automatic", "Gasoline", "sedan"), which published wrong specs.
 *
 * Rules implemented here:
 *  - Never guess. A value is published only when at least one source states
 *    it explicitly: the feed cell, the trim/model text, or an Options entry.
 *  - The feed cell wins when the other sources agree with it (or are silent).
 *    Trim/model text and Options fill a blank feed cell.
 *  - If two sources disagree, the field is unavailable (null) and the
 *    disagreement is recorded in `conflicts` for the data-quality report.
 *  - Options entries are matched as short, unconditional statements only.
 *    VIN-decoded text such as "(Standard on 4WD models.)" or "Traction Select
 *    FWD models feature…" describes other trims and is ignored.
 *
 * Pure and dependency-free so the importer, the backfill script, and page
 * rendering all produce identical results.
 */

export type Drivetrain = "FWD" | "RWD" | "AWD" | "4WD";
export type TransmissionType = "Automatic" | "Manual" | "CVT";
export type FuelType = "Gasoline" | "Diesel" | "Hybrid" | "Plug-In Hybrid" | "Electric" | "Flex Fuel";
export type BodyType =
  | "sedan"
  | "suv"
  | "truck"
  | "van"
  | "coupe"
  | "wagon"
  | "convertible"
  | "hatchback"
  | "commercial";

export type SpecSource = "feed" | "trim" | "model" | "options" | "engine";
export type SpecField = "drivetrain" | "transmission" | "fuel" | "engine" | "bodyType";

export interface SpecConflict {
  field: SpecField;
  values: { source: SpecSource; value: string }[];
}

export interface TransmissionSpec {
  type: TransmissionType;
  speeds: number | null;
  label: string;
}

export interface FuelSpec {
  type: FuelType;
  /** Mild hybrids (48V/12V assist) are labelled distinctly from full hybrids. */
  mild: boolean;
  label: string;
}

export interface EngineSpec {
  label: string;
  displacementL: number | null;
  cylinders: number | null;
  layout: "V" | "Inline" | "Flat" | "W" | null;
  turbo: boolean;
}

export interface VehicleSpecs {
  version: typeof SPECS_VERSION;
  drivetrain: Drivetrain | null;
  transmission: TransmissionSpec | null;
  fuel: FuelSpec | null;
  engine: EngineSpec | null;
  bodyType: BodyType | null;
  exteriorColor: string | null;
  interiorColor: string | null;
  /** Odometer miles, or null when missing/implausible (0 is treated as missing). */
  mileage: number | null;
  /** Upper-cased VIN when well-formed, otherwise null. */
  vin: string | null;
  stockNumber: string | null;
  seating: number | null;
  sources: Partial<Record<SpecField, SpecSource>>;
  conflicts: SpecConflict[];
}

export interface SpecInput {
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  drivetrain?: string | null;
  transmission?: string | null;
  fuelType?: string | null;
  engine?: string | null;
  cylinders?: number | null;
  body?: string | null;
  exteriorColor?: string | null;
  interiorColor?: string | null;
  mileage?: number | null;
  vin?: string | null;
  stockNumber?: string | null;
  seating?: number | null;
  features?: readonly string[] | null;
}

/** Bump when normalization output changes so stored specs get recomputed. */
export const SPECS_VERSION = 1 as const;

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

/** Collapses whitespace and trims. Never changes case. */
export function cleanSpecText(value: unknown, max = 200): string {
  if (typeof value !== "string" && typeof value !== "number") return "";
  return String(value).replace(/\s+/g, " ").trim().slice(0, max);
}

/**
 * Trim for display: whitespace collapsed and Toyota's "(Natl)" region code
 * removed. The stored trim is untouched (slugs are derived from it).
 */
export function displayTrim(trim: string | null | undefined): string {
  return cleanSpecText(trim).replace(/\s*\(\s*natl\.?\s*\)/gi, "").trim();
}

/**
 * Options entries that describe other trims or optional equipment rather than
 * this vehicle. VIN-decoded Options lists are full of these.
 */
const CONDITIONAL_OPTION =
  /\b(if equipped|requires?|required|only|available|not available|deleted when|optional|standard on|reference the|models? feature|when ordered|includes? .* models)\b/i;

function unconditionalOptions(features: readonly string[] | null | undefined, maxLength: number): string[] {
  if (!features) return [];
  const out: string[] = [];
  for (const raw of features) {
    const text = cleanSpecText(raw, 400);
    if (!text || text.length > maxLength || CONDITIONAL_OPTION.test(text)) continue;
    out.push(text);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Drivetrain
// ---------------------------------------------------------------------------

/**
 * Reads an explicit drivetrain statement. Returns null for blank, unknown, or
 * ambiguous text ("2WD" and "4x2" don't say which axle is driven; text naming
 * two different systems is ambiguous).
 */
export function parseDrivetrain(raw: string | null | undefined): Drivetrain | null {
  const s = cleanSpecText(raw).toLowerCase();
  if (!s) return null;
  const found = new Set<Drivetrain>();
  if (/\b(awd|all[\s-]?wheel|xdrive|quattro|4matic|4motion)\b/.test(s)) found.add("AWD");
  if (/\b(4wd|4x4|four[\s-]?wheel[\s-]?drive|4[\s-]?wheel[\s-]?drive)\b/.test(s)) found.add("4WD");
  if (/\b(fwd|front[\s-]?wheel[\s-]?drive|front[\s-]?drive)\b/.test(s)) found.add("FWD");
  if (/\b(rwd|rear[\s-]?wheel[\s-]?drive|rear[\s-]?drive)\b/.test(s)) found.add("RWD");
  // Bare "front wheel"/"rear wheel"/"all wheel" phrases in an explicit cell.
  if (found.size === 0) {
    if (/^front[\s-]?wheel$/.test(s)) found.add("FWD");
    if (/^rear[\s-]?wheel$/.test(s)) found.add("RWD");
  }
  return found.size === 1 ? [...found][0] : null;
}

/** Drivetrain stated by short, unconditional Options entries; null if none or contradictory. */
export function drivetrainFromOptions(features: readonly string[] | null | undefined): Drivetrain | null {
  const found = new Set<Drivetrain>();
  for (const option of unconditionalOptions(features, 50)) {
    // "4-Wheel Disc Brakes" etc. are not drivetrain statements.
    if (/\b(brakes?|abs|disc|seat|tires?|wheels?\s*:)/i.test(option)) continue;
    const value = parseDrivetrain(option);
    if (value) found.add(value);
  }
  return found.size === 1 ? [...found][0] : null;
}

const DRIVETRAIN_LABELS: Record<Drivetrain, string> = {
  FWD: "Front-wheel drive (FWD)",
  RWD: "Rear-wheel drive (RWD)",
  AWD: "All-wheel drive (AWD)",
  "4WD": "Four-wheel drive (4WD)",
};

export function drivetrainLabel(value: Drivetrain): string {
  return DRIVETRAIN_LABELS[value];
}

// ---------------------------------------------------------------------------
// Transmission
// ---------------------------------------------------------------------------

interface ParsedTransmission {
  type: TransmissionType;
  speeds: number | null;
}

function speedsIn(s: string): number | null {
  const match = /(\d{1,2})[\s-]*(?:spd|speed)\b/i.exec(s);
  const n = match ? Number(match[1]) : NaN;
  return n >= 1 && n <= 12 ? n : null;
}

/** Reads an explicit transmission statement (feed cell or an Options entry's text). */
export function parseTransmission(raw: string | null | undefined): ParsedTransmission | null {
  const s = cleanSpecText(raw).toLowerCase();
  if (!s) return null;
  // CVT and automatic are checked before manual: "Automatic w/manual shift
  // mode" and "Lineartronic CVT -inc: 7-speed manual shift mode" are not manuals.
  if (/\b(cvt|e-?cvt|ivt|continuously variable|lineartronic|xtronic)\b/.test(s)) return { type: "CVT", speeds: null };
  if (/\b(automatic|auto|a\/t|dct|dual[\s-]clutch|pdk|tiptronic|steptronic|powershift|s[\s-]?tronic|dsg|automated manual)\b/.test(s)) {
    return { type: "Automatic", speeds: speedsIn(s) };
  }
  if (/\b(manual|m\/t|stick)\b/.test(s)) return { type: "Manual", speeds: speedsIn(s) };
  return null;
}

/** Transmission stated in the trim, e.g. "Si Manual", "SE Nightshade Auto", "Limited CVT". */
export function transmissionFromTrim(trim: string | null | undefined): ParsedTransmission | null {
  const s = cleanSpecText(trim).toLowerCase();
  if (!s) return null;
  const found = new Set<TransmissionType>();
  if (/\bcvt\b/.test(s)) found.add("CVT");
  if (/\b(automatic|auto|a\/t|\d{1,2}at)\b/.test(s)) found.add("Automatic");
  if (/\b(manual|m\/t|\d{1,2}mt)\b/.test(s)) found.add("Manual");
  if (found.size !== 1) return null;
  const type = [...found][0];
  return { type, speeds: type === "CVT" ? null : speedsIn(s) };
}

/**
 * Transmission from Options entries: "6-Speed M/T", "8-Speed A/T",
 * "CVT Transmission", "Transmission: 6-Speed Manual Tremec". Returns null when
 * the list mentions both manual and automatic (decoded data for several trims).
 */
export function transmissionFromOptions(features: readonly string[] | null | undefined): ParsedTransmission | null {
  const found: ParsedTransmission[] = [];
  for (const option of unconditionalOptions(features, 200)) {
    let match: RegExpExecArray | null;
    if ((match = /^(\d{1,2})-speed a\/t$/i.exec(option))) found.push({ type: "Automatic", speeds: Number(match[1]) });
    else if ((match = /^(\d{1,2})-speed m\/t$/i.exec(option))) found.push({ type: "Manual", speeds: Number(match[1]) });
    else if (/^cvt transmission$/i.test(option)) found.push({ type: "CVT", speeds: null });
    else if ((match = /^transmission:\s*(.+)$/i.exec(option))) {
      // Only the part before "-inc:" describes the gearbox itself.
      const parsed = parseTransmission(match[1].split(/\s-inc:/i)[0]);
      if (parsed) found.push(parsed);
    }
  }
  if (found.length === 0) return null;
  const types = new Set(found.map((t) => t.type));
  if (types.has("Manual") && types.size > 1) return null;
  const type: TransmissionType = types.has("CVT") ? "CVT" : types.has("Manual") ? "Manual" : "Automatic";
  const speeds = new Set(found.filter((t) => t.type === type && t.speeds).map((t) => t.speeds));
  return { type, speeds: type !== "CVT" && speeds.size === 1 ? [...speeds][0] : null };
}

function transmissionCompatible(a: TransmissionType, b: TransmissionType): boolean {
  if (a === b) return true;
  // A CVT is a type of automatic transmission.
  return a !== "Manual" && b !== "Manual";
}

export function transmissionLabel(type: TransmissionType, speeds: number | null): string {
  if (type === "CVT") return "Automatic (CVT)";
  return speeds ? `${speeds}-Speed ${type}` : type;
}

// ---------------------------------------------------------------------------
// Fuel
// ---------------------------------------------------------------------------

interface ParsedFuel {
  type: FuelType;
  mild: boolean;
}

/** Reads an explicit fuel statement. Hybrids are checked before "electric". */
export function parseFuel(raw: string | null | undefined): ParsedFuel | null {
  const s = cleanSpecText(raw).toLowerCase();
  if (!s) return null;
  // CNG/LPG/hydrogen aren't modelled; saying "gasoline" would be wrong.
  if (/\b(natural gas|cng|lpg|propane|hydrogen|fuel cell)\b/.test(s)) return null;
  if (/plug[\s-]?in/.test(s)) return { type: "Plug-In Hybrid", mild: false };
  if (/hybrid/.test(s) || /\b(gas|gasoline)\b.*\belectric\b|\belectric\b.*\b(gas|gasoline)\b/.test(s)) {
    return { type: "Hybrid", mild: /\bmild\b/.test(s) };
  }
  if (/\b(electric|ev|bev|battery)\b/.test(s)) return { type: "Electric", mild: false };
  if (/diesel/.test(s)) return { type: "Diesel", mild: false };
  if (/\b(flex|e85|ffv)/.test(s)) return { type: "Flex Fuel", mild: false };
  if (/\b(gas|gasoline|unleaded|petrol|premium|regular)\b/.test(s)) return { type: "Gasoline", mild: false };
  return null;
}

/** Fuel stated by Options entries such as "Gasoline Fuel" or "Gas/Electric Hybrid". */
function fuelEvidenceFromOptions(features: readonly string[] | null | undefined): { fuels: ParsedFuel[]; flexCapable: boolean } {
  const fuels: ParsedFuel[] = [];
  let flexCapable = false;
  for (const option of unconditionalOptions(features, 60)) {
    const s = option.toLowerCase();
    if (s === "gasoline fuel") fuels.push({ type: "Gasoline", mild: false });
    else if (s === "diesel fuel") fuels.push({ type: "Diesel", mild: false });
    else if (s === "electric fuel" || s === "electric fuel system") fuels.push({ type: "Electric", mild: false });
    else if (/^(gas|gasoline)\/(mild )?electric hybrid$/.test(s)) fuels.push({ type: "Hybrid", mild: s.includes("mild") });
    else if (/^plug-in (electric\/gas|hybrid)$/.test(s)) fuels.push({ type: "Plug-In Hybrid", mild: false });
    else if (s === "flex fuel capability" || s === "flex fuel") flexCapable = true;
  }
  return { fuels, flexCapable };
}

const COMBUSTION: ReadonlySet<FuelType> = new Set(["Gasoline", "Hybrid", "Plug-In Hybrid", "Flex Fuel"]);

function fuelCompatible(a: FuelType, b: FuelType): boolean {
  if (a === b) return true;
  // Hybrids and flex-fuel vehicles burn gasoline, so "Gasoline Fuel" is
  // consistent with them. Diesel and battery-electric are distinct.
  return COMBUSTION.has(a) && COMBUSTION.has(b);
}

export function fuelLabel(type: FuelType, mild: boolean): string {
  if (type === "Hybrid" && mild) return "Mild Hybrid (Gasoline)";
  if (type === "Flex Fuel") return "Flex Fuel (Gasoline/E85)";
  return type;
}

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

/**
 * Formats Autofunds engine text: "2 4 Cylinder Engine" → "2.0L 4-Cylinder",
 * "3.5 Liter V6 Cylinder Engine" → "3.5L V6", "14.9 Straight 6 Cylinder
 * Engine" → "14.9L Inline-6". Unrecognized text is kept as-is (it is still the
 * dealer's own data) unless it is a placeholder.
 */
export function parseEngine(raw: string | null | undefined, turbo = false): EngineSpec | null {
  const text = cleanSpecText(raw, 120);
  if (!text || /^(n\/?a|none|unknown|other|tbd|0|-+)$/i.test(text)) return null;
  if (/^electric( motor)?$/i.test(text)) {
    return { label: "Electric motor", displacementL: null, cylinders: null, layout: null, turbo: false };
  }
  const re =
    /^(?:(\d{1,2}(?:\.\d)?)\s*(?:l|liter|litre)?\s+)?(?:(v|w)\s?(\d{1,2})|(straight|inline|in-line|i|flat|h|boxer)[\s-]?(\d{1,2})|(\d{1,2}))[\s-]*cyl(?:inder)?s?\b(?:\s+engine)?$/i;
  const match = re.exec(text);
  if (!match) {
    return { label: text, displacementL: null, cylinders: null, layout: null, turbo };
  }
  const displacement = match[1] ? Number(match[1]) : null;
  const layoutRaw = (match[2] || match[4] || "").toLowerCase();
  const cylinders = Number(match[3] || match[5] || match[6]);
  if (!Number.isInteger(cylinders) || cylinders < 1 || cylinders > 16) {
    return { label: text, displacementL: null, cylinders: null, layout: null, turbo };
  }
  const layout: EngineSpec["layout"] =
    layoutRaw === "v" ? "V" : layoutRaw === "w" ? "W" : /^(straight|inline|in-line|i)$/.test(layoutRaw) ? "Inline" : /^(flat|h|boxer)$/.test(layoutRaw) ? "Flat" : null;
  const disp = displacement && displacement > 0 && displacement < 20 ? displacement : null;
  const config =
    layout === "V" || layout === "W" ? `${layout}${cylinders}` : layout ? `${layout}-${cylinders}` : `${cylinders}-Cylinder`;
  const label = [turbo ? "Turbocharged" : "", disp ? `${disp.toFixed(1)}L` : "", config].filter(Boolean).join(" ");
  return { label, displacementL: disp, cylinders, layout, turbo };
}

// ---------------------------------------------------------------------------
// Body style
// ---------------------------------------------------------------------------

/** Maps Autofunds "Body" text (or an already-normalized value) to a body type; null if unknown. */
export function parseBodyType(raw: string | null | undefined): BodyType | null {
  const s = cleanSpecText(raw).toLowerCase();
  if (!s) return null;
  if (/\b(convertible|cabriolet|roadster|spyder|spider)\b/.test(s)) return "convertible";
  if (/\b(pickup|truck|crew ?cab|extended cab|regular cab|super ?cab|super ?crew|quad cab|double cab|access cab|king cab|mega cab|chassis|tractor|conventional|sleeper|cutaway|box|stake|dump|rollback)\b/.test(s)) {
    return "truck";
  }
  if (/\b(van|minivan)\b/.test(s)) return "van";
  if (/\b(hatch|hatchback|liftback)\b/.test(s)) return "hatchback";
  if (/\b(wagon|wgn|estate|sportwagen)\b/.test(s)) return "wagon";
  if (/\b(suv|sport utility|utility|crossover)\b/.test(s)) return "suv";
  if (/\b(coupe|2 ?door|2dr)\b/.test(s)) return "coupe";
  if (/\b(sedan|saloon|4 ?door|4dr)\b/.test(s)) return "sedan";
  if (/\bcommercial\b/.test(s)) return "commercial";
  return null;
}

/** Body style named in the model designation itself ("Civic Hatchback", "Transit Cargo Van"). */
export function bodyTypeFromModel(model: string | null | undefined): BodyType | null {
  const s = cleanSpecText(model).toLowerCase();
  if (!s) return null;
  if (/\b(convertible|cabriolet|roadster)\b/.test(s)) return "convertible";
  if (/\b(pickup|crew ?cab|chassis cab)\b/.test(s)) return "truck";
  if (/\bvan\b/.test(s)) return "van";
  if (/\bhatchback\b/.test(s)) return "hatchback";
  if (/\b(wagon|sportwagen)\b/.test(s)) return "wagon";
  if (/\bcoupe\b/.test(s)) return "coupe";
  if (/\bsedan\b/.test(s)) return "sedan";
  return null;
}

const BODY_LABELS: Record<BodyType, string> = {
  sedan: "Sedan",
  suv: "SUV",
  truck: "Truck",
  van: "Van",
  coupe: "Coupe",
  wagon: "Wagon",
  convertible: "Convertible",
  hatchback: "Hatchback",
  commercial: "Commercial",
};

export function bodyTypeLabel(value: BodyType): string {
  return BODY_LABELS[value];
}

// ---------------------------------------------------------------------------
// Colors, mileage, identifiers
// ---------------------------------------------------------------------------

function titleCaseIfShouting(s: string): string {
  if (s !== s.toUpperCase() || !/[A-Z]{3}/.test(s)) return s;
  return s.toLowerCase().replace(/\b([a-z])/g, (c) => c.toUpperCase());
}

/** "Black Interior" → "Black"; placeholders ("N/A", "Other") → null. */
export function cleanColor(raw: string | null | undefined): string | null {
  let s = cleanSpecText(raw, 80);
  s = s.replace(/\s+(interior|exterior|int\.?|ext\.?)$/i, "").trim();
  if (!s || /^(n\/?a|none|unknown|other|tbd|not specified|see dealer|call|-+|\.|0)$/i.test(s)) return null;
  return titleCaseIfShouting(s);
}

/** Used vehicles with 0 miles are a missing value in this feed, not a fact. */
export function normalizeMileage(raw: number | string | null | undefined): number | null {
  const n = typeof raw === "string" ? Number(raw.replace(/[,\s]/g, "")) : raw;
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  const miles = Math.round(n);
  return miles >= 1 && miles <= 2_000_000 ? miles : null;
}

const VIN_TRANSLITERATION: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9, S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
};
const VIN_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

/** Upper-cased VIN if it is well-formed (17 characters, no I/O/Q); otherwise null. */
export function normalizeVin(raw: string | null | undefined, year?: number): string | null {
  const vin = cleanSpecText(raw, 40).toUpperCase().replace(/[\s-]/g, "");
  if (/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) return vin;
  // Pre-1981 vehicles predate the 17-character standard.
  if (year && year < 1981 && /^[A-Z0-9]{5,17}$/.test(vin)) return vin;
  return null;
}

/** North American check digit (position 9). Informational: a mismatch is reported, not hidden. */
export function vinCheckDigitValid(vin: string): boolean {
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) return false;
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const c = vin[i];
    sum += (/[0-9]/.test(c) ? Number(c) : VIN_TRANSLITERATION[c]) * VIN_WEIGHTS[i];
  }
  const remainder = sum % 11;
  return vin[8] === (remainder === 10 ? "X" : String(remainder));
}

export function normalizeStockNumber(raw: string | null | undefined): string | null {
  const s = cleanSpecText(raw, 40);
  return s || null;
}

function boundedInt(raw: number | null | undefined, min: number, max: number): number | null {
  return typeof raw === "number" && Number.isInteger(raw) && raw >= min && raw <= max ? raw : null;
}

// ---------------------------------------------------------------------------
// Resolution
// ---------------------------------------------------------------------------

interface Candidate<T> {
  source: SpecSource;
  value: T | null;
}

/**
 * Picks the first non-null candidate (priority order) when every non-null
 * candidate is compatible with it; otherwise reports a conflict.
 */
function resolveCandidates<T>(
  field: SpecField,
  candidates: Candidate<T>[],
  compatible: (a: T, b: T) => boolean,
  describe: (value: T) => string,
  conflicts: SpecConflict[]
): { value: T; source: SpecSource } | null {
  const present = candidates.filter((c): c is { source: SpecSource; value: T } => c.value !== null);
  if (present.length === 0) return null;
  const [first] = present;
  if (present.every((c) => compatible(first.value, c.value))) return first;
  conflicts.push({ field, values: present.map((c) => ({ source: c.source, value: describe(c.value) })) });
  return null;
}

export function normalizeVehicleSpecs(input: SpecInput): VehicleSpecs {
  const conflicts: SpecConflict[] = [];
  const sources: VehicleSpecs["sources"] = {};
  const trim = cleanSpecText(input.trim);
  const model = cleanSpecText(input.model);
  const features = input.features ?? [];

  // Drivetrain: feed cell, then trim/model text, then Options.
  const drivetrain = resolveCandidates<Drivetrain>(
    "drivetrain",
    [
      { source: "feed", value: parseDrivetrain(input.drivetrain) },
      { source: "trim", value: parseDrivetrain(trim) },
      { source: "model", value: parseDrivetrain(model) },
      { source: "options", value: drivetrainFromOptions(features) },
    ],
    (a, b) => a === b,
    (v) => v,
    conflicts
  );
  if (drivetrain) sources.drivetrain = drivetrain.source;

  // Transmission: the type must agree; speeds are filled from the most specific source.
  const transmissionCandidates: Candidate<ParsedTransmission>[] = [
    { source: "feed", value: parseTransmission(input.transmission) },
    { source: "trim", value: transmissionFromTrim(trim) },
    { source: "options", value: transmissionFromOptions(features) },
  ];
  const transmissionPick = resolveCandidates<ParsedTransmission>(
    "transmission",
    transmissionCandidates,
    (a, b) => transmissionCompatible(a.type, b.type),
    (v) => transmissionLabel(v.type, v.speeds),
    conflicts
  );
  let transmission: TransmissionSpec | null = null;
  if (transmissionPick) {
    const agreeing = transmissionCandidates
      .map((c) => c.value)
      .filter((v): v is ParsedTransmission => v !== null);
    // "Automatic" + an Options "CVT Transmission" → a CVT automatic.
    const type: TransmissionType = agreeing.some((v) => v.type === "CVT") ? "CVT" : transmissionPick.value.type;
    const speedValues = new Set(agreeing.filter((v) => v.type === type && v.speeds).map((v) => v.speeds as number));
    const speeds = type !== "CVT" && speedValues.size === 1 ? [...speedValues][0] : null;
    transmission = { type, speeds, label: transmissionLabel(type, speeds) };
    sources.transmission = transmissionPick.source;
  }

  // Engine first: a combustion engine contradicts an "Electric" fuel value.
  const turbo = unconditionalOptions(features, 40).some((o) => /^(turbo|turbocharged|twin turbo|twin-turbo)$/i.test(o));
  let engine = parseEngine(input.engine, turbo);
  const cylindersField = boundedInt(input.cylinders, 1, 16);
  if (engine?.cylinders && cylindersField && engine.cylinders !== cylindersField) {
    conflicts.push({
      field: "engine",
      values: [
        { source: "feed", value: engine.label },
        { source: "feed", value: `${cylindersField} cylinders` },
      ],
    });
    engine = null;
  }
  if (engine) sources.engine = "feed";

  // Fuel: feed cell vs Options; a stated combustion engine rules out "Electric".
  const optionFuel = fuelEvidenceFromOptions(features);
  const optionTypes = new Set(optionFuel.fuels.map((f) => f.type));
  const optionsAgree = [...optionTypes].every((t) => fuelCompatible([...optionTypes][0], t));
  const optionsValue: ParsedFuel | null =
    optionFuel.fuels.length && optionsAgree
      ? optionFuel.fuels.find((f) => f.type !== "Gasoline") ?? optionFuel.fuels[0]
      : null;
  let fuelPick = resolveCandidates<ParsedFuel>(
    "fuel",
    [
      { source: "feed", value: parseFuel(input.fuelType) },
      { source: "options", value: optionsValue },
    ],
    (a, b) => fuelCompatible(a.type, b.type),
    (v) => fuelLabel(v.type, v.mild),
    conflicts
  );
  // A piston engine contradicts "Electric" (the old parser turned
  // "Gas/Electric Hybrid" into electric).
  const pistonEngine = engine?.cylinders ?? cylindersField;
  if (fuelPick?.value.type === "Electric" && pistonEngine) {
    conflicts.push({
      field: "fuel",
      values: [
        { source: fuelPick.source, value: "Electric" },
        { source: "engine", value: engine?.label ?? `${pistonEngine} cylinders` },
      ],
    });
    fuelPick = null;
  }
  let fuel: FuelSpec | null = null;
  if (fuelPick) {
    let { type, mild } = fuelPick.value;
    if (type === "Hybrid" && !mild && optionFuel.fuels.some((f) => f.type === "Hybrid" && f.mild)) mild = true;
    if (type === "Gasoline" && optionFuel.flexCapable) type = "Flex Fuel";
    fuel = { type, mild, label: fuelLabel(type, mild) };
    sources.fuel = fuelPick.source;
  }

  // Body: a body style named in the model designation beats the Body cell.
  const modelBody = bodyTypeFromModel(model);
  const feedBody = parseBodyType(input.body);
  const bodyType = modelBody ?? feedBody;
  if (bodyType) sources.bodyType = modelBody ? "model" : "feed";

  return {
    version: SPECS_VERSION,
    drivetrain: drivetrain?.value ?? null,
    transmission,
    fuel,
    engine,
    bodyType,
    exteriorColor: cleanColor(input.exteriorColor),
    interiorColor: cleanColor(input.interiorColor),
    mileage: normalizeMileage(input.mileage),
    vin: normalizeVin(input.vin, input.year),
    stockNumber: normalizeStockNumber(input.stockNumber),
    seating: boundedInt(input.seating, 1, 15),
    sources,
    conflicts,
  };
}
