/**
 * Backfill vehicle descriptions and normalized specs for existing inventory.
 *
 *   npx tsx scripts/backfill-vehicle-descriptions.ts                 # dry run: report only
 *   npx tsx scripts/backfill-vehicle-descriptions.ts --apply         # write changes
 *   npx tsx scripts/backfill-vehicle-descriptions.ts --apply --limit 20
 *   npx tsx scripts/backfill-vehicle-descriptions.ts --apply --after <id>   # resume
 *   npx tsx scripts/backfill-vehicle-descriptions.ts --apply --ai           # + optional AI rewrite
 *
 * Options:
 *   --apply          Write changes (default: dry run, no writes).
 *   --limit N        Process at most N rows.
 *   --after ID       Resume after this inventory id (printed as "cursor").
 *   --page-size N    Rows per request (default 100).
 *   --include-sold   Also process sold/inactive rows (not shown on the site).
 *   --ai             Rewrite generated text with Claude. Requires
 *                    DESCRIPTION_AI_ENABLED=true and ANTHROPIC_API_KEY. Capped by
 *                    DESCRIPTION_AI_MAX_PER_RUN (default 25); results are cached
 *                    by facts hash, so re-runs don't pay again.
 *   --verbose        List every changed vehicle and field.
 *
 * Safe by design: idempotent (a second run reports 0 changes), resumable,
 * never overwrites manual descriptions, and never touches price, status,
 * photos, or sold flags. Requires the 20261109 migration.
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (from
 * .env.local if present).
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { aiEnabled, aiMaxPerRun, createAnthropicEnhancer } from "../lib/descriptions/ai";
import { backfillDescriptions } from "../lib/server/descriptionBackfill";
import { inventoryRestConfig } from "../lib/server/inventory-rest";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const verbose = process.argv.includes("--verbose");
  const limit = arg("--limit") ? Number(arg("--limit")) : undefined;
  const pageSize = arg("--page-size") ? Number(arg("--page-size")) : undefined;
  const wantAi = process.argv.includes("--ai");

  let enhancer = null;
  if (wantAi) {
    if (!aiEnabled()) {
      console.error("--ai requires DESCRIPTION_AI_ENABLED=true and ANTHROPIC_API_KEY. Continuing without AI.");
    } else if (!apply) {
      console.log("--ai is ignored in a dry run (no paid requests without --apply).");
    } else {
      enhancer = createAnthropicEnhancer({ model: process.env.DESCRIPTION_AI_MODEL, maxRequests: aiMaxPerRun() });
      console.log(`AI enhancement on: ${enhancer.generator}, max ${aiMaxPerRun()} requests this run.`);
    }
  }

  console.log(`[backfill] mode: ${apply ? "APPLY" : "dry run (no writes)"}`);
  const summary = await backfillDescriptions(inventoryRestConfig(), {
    apply,
    limit,
    pageSize,
    afterId: arg("--after") ?? null,
    includeSold: process.argv.includes("--include-sold"),
    enhancer,
    onPage: (s) => console.log(`[backfill] scanned=${s.scanned} changed=${s.changed} written=${s.written} cursor=${s.lastId}`),
  });

  if (verbose || !apply) {
    for (const change of summary.changes) {
      console.log(`  ${change.vehicle} (${change.vin ?? change.id}) → ${change.descriptionSource}: ${change.fields.join(", ")}`);
    }
  }
  const { changes, ...counts } = summary;
  console.log(JSON.stringify({ ...counts, changesListed: changes.length, ai: enhancer?.usage }, null, 2));
  if (!summary.done) console.log(`Stopped before the end. Resume with: --after ${summary.lastId}`);
  if (summary.errors.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(`[backfill] failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
