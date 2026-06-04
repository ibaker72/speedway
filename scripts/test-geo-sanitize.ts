// Local verification script for lib/geo/sanitize.ts.
//
// Runs the full set of input → expected cases enumerated in the geo-page
// task brief plus the false-positive guard cases. Exits non-zero if any
// case fails.
//
// Usage:
//   node --experimental-strip-types scripts/test-geo-sanitize.ts

import {
  normalizeCity,
  normalizeState,
  normalizeTextSpacing,
  buildProperNounAnchors,
  detectSuspiciousMerges,
  sanitizeGeneratedGeoPage,
} from "../lib/geo/sanitize.ts";

type SanitizerCase = { input: string; expected: string };

const SANITIZER_CASES: SanitizerCase[] = [
  { input: "just ashort drive", expected: "just a short drive" },
  { input: "Speedway Motors LLCstocks", expected: "Speedway Motors LLC stocks" },
  { input: "rangeof makes", expected: "range of makes" },
  { input: "Santa Fe SEAWD", expected: "Santa Fe SE AWD" },
  { input: "situations,so", expected: "situations, so" },
  { input: "findingyour next ride", expected: "finding your next ride" },
  { input: "21years", expected: "21 years" },
  { input: "ourdiverse inventory", expected: "our diverse inventory" },
  { input: "ourPaterson location", expected: "our Paterson location" },
  { input: "NearClifton", expected: "Near Clifton" },
  { input: "reliableused car", expected: "reliable used car" },
  { input: "Lookingfor something", expected: "Looking for something" },
  { input: "CVTat $24,487", expected: "CVT at $24,487" },
  { input: "Makesand Models", expected: "Makes and Models" },
  { input: "SportHybrid", expected: "Sport Hybrid" },
  { input: "oneroof", expected: "one roof" },
  { input: "pathto ownership", expected: "path to ownership" },
  { input: "currentvehicle", expected: "current vehicle" },
  { input: "coming infrom Newark", expected: "coming in from Newark" },
  { input: "andthe team", expected: "and the team" },
  { input: "let usput", expected: "let us put" },
  { input: "SpeedwayMotors LLC", expected: "Speedway Motors LLC" },
  { input: "one ofthe best", expected: "one of the best" },
  { input: "Servingnewark", expected: "Serving Newark" },
  { input: "newark Drivers", expected: "Newark Drivers" },
  { input: "financeteam", expected: "finance team" },
  { input: "theirvery first vehicle", expected: "their very first vehicle" },
  { input: "loanterms", expected: "loan terms" },
  { input: "communityplaces", expected: "community places" },
  { input: "usedcars", expected: "used cars" },
  { input: "badcredit", expected: "bad credit" },
  { input: "Thereis", expected: "There is" },
  { input: "greatvehicle", expected: "great vehicle" },
];

const FALSE_POSITIVE_INPUTS: string[] = [
  "Clifton's",
  "without",
  "Tradesman",
  "everything",
  "dealership",
  "vehicles",
  "financing",
  "inventory",
];

const CITY_NORMALIZATION_CASES: Array<[string, string]> = [
  ["newark", "Newark"],
  ["NEWARK", "Newark"],
  ["jersey city", "Jersey City"],
  ["passaic", "Passaic"],
];

const STATE_NORMALIZATION_CASES: Array<[string, string]> = [
  ["nj", "NJ"],
  ["NJ", "NJ"],
  ["new jersey", "New Jersey"],
  ["New Jersey", "New Jersey"],
];

interface Result {
  passes: number;
  failures: Array<{ label: string; expected: string; actual: string }>;
}

function pad(s: string, w: number): string {
  return s.length >= w ? s : s + " ".repeat(w - s.length);
}

function ok(label: string) {
  console.log(`  ${"✓"} ${label}`);
}

function fail(label: string, expected: string, actual: string) {
  console.log(`  ${"✗"} ${label}`);
  console.log(`      expected: ${JSON.stringify(expected)}`);
  console.log(`      actual:   ${JSON.stringify(actual)}`);
}

function runCityStateNormalization(result: Result) {
  console.log("\nCity / state normalisation:");
  for (const [input, expected] of CITY_NORMALIZATION_CASES) {
    const actual = normalizeCity(input);
    if (actual === expected) {
      result.passes++;
      ok(`normalizeCity(${JSON.stringify(input)}) → ${JSON.stringify(expected)}`);
    } else {
      result.failures.push({
        label: `normalizeCity(${JSON.stringify(input)})`,
        expected,
        actual,
      });
      fail(`normalizeCity(${JSON.stringify(input)})`, expected, actual);
    }
  }
  for (const [input, expected] of STATE_NORMALIZATION_CASES) {
    const actual = normalizeState(input);
    if (actual === expected) {
      result.passes++;
      ok(`normalizeState(${JSON.stringify(input)}) → ${JSON.stringify(expected)}`);
    } else {
      result.failures.push({
        label: `normalizeState(${JSON.stringify(input)})`,
        expected,
        actual,
      });
      fail(`normalizeState(${JSON.stringify(input)})`, expected, actual);
    }
  }
}

function runSanitizerCases(result: Result) {
  console.log("\nSanitizer input → expected (Newark context):");
  // Use a Newark/NJ context with vehicle makes that show up in the brief.
  const anchors = buildProperNounAnchors("Newark", "NJ", [
    "Honda",
    "Toyota",
    "Nissan",
    "Hyundai",
    "Mercedes-Benz",
    "Ford",
    "Kia",
  ]);
  // Also re-test the Clifton-only cases under Clifton anchors so
  // "NearClifton" passes deterministically.
  const cliftonAnchors = buildProperNounAnchors("Clifton", "NJ", [
    "Honda",
    "Toyota",
    "Nissan",
    "Hyundai",
    "Mercedes-Benz",
    "Ford",
    "Kia",
  ]);

  for (const c of SANITIZER_CASES) {
    // Pick the anchor set that contains the city referenced in the case.
    const usesClifton = /Clifton/i.test(c.input) || /Clifton/i.test(c.expected);
    const anchorSet = usesClifton ? cliftonAnchors : anchors;
    const actual = normalizeTextSpacing(c.input, anchorSet);
    const label = `${pad(JSON.stringify(c.input), 38)} → ${JSON.stringify(c.expected)}`;
    if (actual === c.expected) {
      result.passes++;
      ok(label);
    } else {
      result.failures.push({ label, expected: c.expected, actual });
      fail(label, c.expected, actual);
    }
  }
}

function runFalsePositiveGuard(result: Result) {
  console.log("\nFalse-positive guard (must not change, must not warn):");
  const anchors = buildProperNounAnchors("Clifton", "NJ", [
    "Honda",
    "Toyota",
    "Nissan",
  ]);
  for (const input of FALSE_POSITIVE_INPUTS) {
    const cleaned = normalizeTextSpacing(input, anchors);
    const warnings = detectSuspiciousMerges(cleaned);
    const unchanged = cleaned === input;
    const noWarn = warnings.length === 0;
    if (unchanged && noWarn) {
      result.passes++;
      ok(`${JSON.stringify(input)} unchanged, no warning`);
    } else {
      const label = `${JSON.stringify(input)} unchanged, no warning`;
      const detail = unchanged
        ? `warnings=${JSON.stringify(warnings)}`
        : `mutated to ${JSON.stringify(cleaned)} (warnings=${JSON.stringify(warnings)})`;
      result.failures.push({ label, expected: "unchanged, no warning", actual: detail });
      fail(label, "unchanged, no warning", detail);
    }
  }
}

function runSuspiciousMergeWarningCases(result: Result) {
  console.log("\nSuspicious-merge detector (must warn):");
  const mustWarn: string[] = [
    "currentvehicle",
    "reliableused",
    "loanterms",
    "findingyour",
    "rangeof",
    "SpeedwayMotors",
    "badcredit",
  ];
  for (const token of mustWarn) {
    const warnings = detectSuspiciousMerges(token);
    if (warnings.includes(token)) {
      result.passes++;
      ok(`detectSuspiciousMerges(${JSON.stringify(token)}) flagged`);
    } else {
      result.failures.push({
        label: `detectSuspiciousMerges(${JSON.stringify(token)})`,
        expected: `${token} flagged`,
        actual: JSON.stringify(warnings),
      });
      fail(
        `detectSuspiciousMerges(${JSON.stringify(token)})`,
        `${token} flagged`,
        JSON.stringify(warnings)
      );
    }
  }
}

function runSanitizerSmokeTest(result: Result) {
  console.log("\nEnd-to-end sanitizeGeneratedGeoPage smoke test:");
  const sections = {
    meta_title: "Used Cars in Newark, NJ | SpeedwayMotors LLC",
    h1_heading: "Quality Used Cars NearNewark, NJ",
    intro_paragraph:
      "Speedway Motors LLCstocks 180+ vehicles for newark drivers. Servingnewark with 21years of experience and a 4.8-star Google rating. ourdiverse inventory covers sedans,SUVs,and trucks.",
    inventory_paragraph:
      "From a Honda HR-V to a Mercedes-BenzGLC,we carry a wide rangeof makes and models. Browse a Santa Fe SEAWD or a CVTat $24,487. Currentvehicle list updated daily.",
    financing_paragraph:
      "Lookingfor financing? Our financeteam helps with badcredit and no-credit applications. We work with multipledealerships of lenders for loanterms that fit your budget.",
    trade_in_paragraph:
      "Bring your currentvehicle to our Paterson showroom. Our team gives fair offers in minutes. Theirvery first vehicle often becomes a trade-in toward a greatvehicle.",
    why_choose_paragraph:
      "21years in business. Servingnewark and the wider community,we put customers first. Thereis a reason buyers choose us — one ofthe few dealerships that combines selection with service.",
  };

  const out = sanitizeGeneratedGeoPage(sections, {
    city: "Newark",
    state: "NJ",
    vehicleMakes: ["Honda", "Toyota", "Nissan", "Hyundai", "Mercedes-Benz"],
  });

  console.log("    meta_title  →", JSON.stringify(out.data.meta_title));
  console.log("    h1_heading  →", JSON.stringify(out.data.h1_heading));
  console.log("    warnings    →", JSON.stringify(out.warnings));

  const html = out.data.page_content_html;
  const expectedMarkers = [
    `<a href="/inventory">browse our full inventory</a>`,
    `<a href="/finance">Apply for financing</a>`,
    `<h2>Quality Used Cars Serving Newark, NJ</h2>`,
    `<h2>Auto Financing for Newark Drivers</h2>`,
    `<h2>Trade In Your Current Vehicle</h2>`,
    `<h2>Why Choose Speedway Motors LLC</h2>`,
  ];
  for (const marker of expectedMarkers) {
    if (html.includes(marker)) {
      result.passes++;
      ok(`page_content_html contains ${JSON.stringify(marker)}`);
    } else {
      result.failures.push({
        label: `page_content_html contains ${JSON.stringify(marker)}`,
        expected: "present",
        actual: "missing",
      });
      fail(`page_content_html contains ${marker}`, "present", "missing");
    }
  }

  const bannedSubstrings = [
    "LLCstocks",
    "rangeof",
    "SEAWD",
    "CVTat",
    "findingyour",
    "loanterms",
    "badcredit",
    "ourdiverse",
    "Servingnewark",
    "newark Drivers",
    "SpeedwayMotors",
    "Mercedes-BenzGLC",
    "currentvehicle",
    "Thereis",
    "21years",
    "ofthe",
  ];
  for (const banned of bannedSubstrings) {
    if (!html.includes(banned)) {
      result.passes++;
      ok(`page_content_html does NOT contain ${JSON.stringify(banned)}`);
    } else {
      result.failures.push({
        label: `page_content_html does NOT contain ${JSON.stringify(banned)}`,
        expected: "absent",
        actual: "present",
      });
      fail(`page_content_html does NOT contain ${banned}`, "absent", "present");
    }
  }
}

function main() {
  const result: Result = { passes: 0, failures: [] };
  runCityStateNormalization(result);
  runSanitizerCases(result);
  runFalsePositiveGuard(result);
  runSuspiciousMergeWarningCases(result);
  runSanitizerSmokeTest(result);

  console.log(
    `\nSummary: ${result.passes} passed, ${result.failures.length} failed`
  );
  if (result.failures.length > 0) {
    process.exitCode = 1;
  }
}

main();
