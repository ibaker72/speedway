/**
 * Buyer-relevant equipment picked from the Autofunds Options list.
 *
 * The Options list is VIN-decoded equipment (avg. ~160 entries) and mixes
 * useful items ("Navigation System") with noise ("Driver Vanity Mirror") and
 * conditional notes for other trims ("…(Requires AWD models.)"). Only short,
 * unconditional entries are considered, and each highlight maps to a fixed,
 * plain-language label so descriptions never paraphrase a feature into
 * something the listing doesn't say.
 */

export interface FeatureHighlight {
  key: string;
  /** Lower-case phrase for use inside a sentence. */
  phrase: string;
  /** Title-case label for chips and lists. */
  label: string;
}

interface FeatureRule extends FeatureHighlight {
  pattern: RegExp;
}

// Ordered by how much shoppers care; descriptions use the first few matches.
const RULES: FeatureRule[] = [
  { key: "third-row", phrase: "third-row seating", label: "Third-Row Seating", pattern: /\b(3rd|third)[\s-]row\b/i },
  { key: "navigation", phrase: "navigation", label: "Navigation", pattern: /\bnavigation\b|\bnav system\b/i },
  { key: "carplay", phrase: "Apple CarPlay", label: "Apple CarPlay", pattern: /\bapple carplay\b/i },
  { key: "android-auto", phrase: "Android Auto", label: "Android Auto", pattern: /\bandroid auto\b/i },
  { key: "backup-camera", phrase: "a backup camera", label: "Backup Camera", pattern: /\b(back[\s-]?up|rear[\s-]?view|rear[\s-]?vision|reverse)\s+camera\b/i },
  { key: "surround-camera", phrase: "a surround-view camera", label: "Surround-View Camera", pattern: /\b(360|surround[\s-]view|bird'?s[\s-]eye)\b.*\bcamera\b/i },
  { key: "leather", phrase: "leather seating", label: "Leather Seats", pattern: /\bleather\b.*\bseat|\bseat.*\bleather\b|^leather( seats| upholstery)?$/i },
  { key: "heated-seats", phrase: "heated seats", label: "Heated Seats", pattern: /\bheated\b[^,;]*\bseats?\b|\bheated[\s-](cushion|seatback)/i },
  { key: "ventilated-seats", phrase: "ventilated front seats", label: "Ventilated Seats", pattern: /\b(ventilated|cooled) (front )?seats?\b/i },
  { key: "sunroof", phrase: "a sunroof", label: "Sunroof/Moonroof", pattern: /\b(sun|moon)\s?roof\b|\bpanoramic (glass )?roof\b/i },
  { key: "remote-start", phrase: "remote start", label: "Remote Start", pattern: /\bremote (engine )?start\b/i },
  { key: "adaptive-cruise", phrase: "adaptive cruise control", label: "Adaptive Cruise Control", pattern: /\badaptive cruise\b/i },
  { key: "blind-spot", phrase: "blind-spot monitoring", label: "Blind-Spot Monitoring", pattern: /\bblind[\s-]spot\b/i },
  { key: "lane-assist", phrase: "lane-keeping assist", label: "Lane-Keeping Assist", pattern: /\blane (keep|keeping|departure|centering)\b/i },
  { key: "heated-wheel", phrase: "a heated steering wheel", label: "Heated Steering Wheel", pattern: /\bheated steering wheel\b/i },
  { key: "premium-audio", phrase: "a premium audio system", label: "Premium Audio", pattern: /\b(bose|harman kardon|bang & olufsen|b&o|burmester|jbl|mark levinson|meridian|premium (audio|sound))\b/i },
  { key: "power-liftgate", phrase: "a power liftgate", label: "Power Liftgate", pattern: /\bpower (lift ?gate|tailgate|rear liftgate)\b/i },
  { key: "power-sliding-doors", phrase: "power sliding doors", label: "Power Sliding Doors", pattern: /\bpower sliding (side )?doors?\b/i },
  { key: "tow-hitch", phrase: "a trailer hitch", label: "Trailer Hitch", pattern: /\b(trailer|tow)(ing)? hitch\b|\bhitch receiver\b/i },
  { key: "keyless", phrase: "keyless entry", label: "Keyless Entry", pattern: /\bkeyless (entry|start|ignition|go)\b|\bpush[\s-]button start\b|\bproximity key\b/i },
  { key: "bluetooth", phrase: "Bluetooth", label: "Bluetooth", pattern: /\bbluetooth\b/i },
  { key: "dual-zone", phrase: "dual-zone climate control", label: "Dual-Zone Climate Control", pattern: /\bdual[\s-]zone\b.*\b(climate|air conditioning|a\/c)\b/i },
  { key: "wireless-charging", phrase: "wireless phone charging", label: "Wireless Charging", pattern: /\bwireless (phone |device )?charg/i },
  { key: "parking-sensors", phrase: "parking sensors", label: "Parking Sensors", pattern: /\b(parking|park) (sensors|assist|aid)\b/i },
  { key: "running-boards", phrase: "running boards", label: "Running Boards", pattern: /\brunning boards\b|\bside steps\b/i },
  { key: "bedliner", phrase: "a bedliner", label: "Bedliner", pattern: /\bbed ?liner\b/i },
  { key: "fog-lamps", phrase: "fog lamps", label: "Fog Lamps", pattern: /^fog (lamps|lights)$|^front fog (lamps|lights)$/i },
  { key: "alloy-wheels", phrase: "alloy wheels", label: "Alloy Wheels", pattern: /^alloy wheels$|^aluminum wheels$/i },
];

const CONDITIONAL =
  /\b(if equipped|requires?|required|only|available|not available|deleted when|optional|standard on|reference the|delete|prep|pre-wire|provisions?)\b/i;

/**
 * Highlights present in the vehicle's own Options list, in priority order and
 * de-duplicated by feature. Entries over 120 characters (decoded spec prose)
 * and conditional entries are ignored.
 */
export function selectFeatureHighlights(features: readonly string[] | null | undefined, max = 10): FeatureHighlight[] {
  if (!features?.length) return [];
  const options = features
    .map((f) => (typeof f === "string" ? f.replace(/\s+/g, " ").trim() : ""))
    .filter((f) => f && f.length <= 120 && !CONDITIONAL.test(f));
  const picked: FeatureHighlight[] = [];
  for (const rule of RULES) {
    if (picked.length >= max) break;
    if (options.some((o) => rule.pattern.test(o))) {
      picked.push({ key: rule.key, phrase: rule.phrase, label: rule.label });
    }
  }
  return picked;
}

/** Options list cleaned for the "All equipment" section: trimmed, de-duplicated, conditionals dropped. */
export function cleanEquipmentList(features: readonly string[] | null | undefined): string[] {
  if (!features?.length) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of features) {
    const text = typeof raw === "string" ? raw.replace(/\s+/g, " ").trim() : "";
    if (!text || CONDITIONAL.test(text)) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(text);
  }
  return out;
}
