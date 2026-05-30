/**
 * Test script: download the Autofunds CSV from SFTP, parse it, and print a summary.
 * Supports --dry-run (default) to skip Supabase writes.
 *
 * Usage:
 *   npx tsx scripts/test-import-inventory.ts            # dry-run (no DB writes)
 *   npx tsx scripts/test-import-inventory.ts --import   # write to Supabase
 *   npx tsx scripts/test-import-inventory.ts --local path/to/file.csv  # parse a local file
 */

import { readFileSync } from "fs";
import { config } from "dotenv";

// Load .env.local if present
config({ path: ".env.local" });

import { fetchCsvViaSftp } from "../lib/feed/sftp-client";
import { parseAutofundsCsv } from "../lib/feed/autofunds-parser";
import { importVehicles } from "../lib/server/importVehicles";

const args = process.argv.slice(2);
const doImport = args.includes("--import");
const localIdx = args.indexOf("--local");
const localFile = localIdx !== -1 ? args[localIdx + 1] : null;

async function main() {
  let csvText: string;

  if (localFile) {
    console.log(`[test-import] reading local file: ${localFile}`);
    csvText = readFileSync(localFile, "utf-8");
  } else {
    const host = process.env.SFTP_HOST ?? process.env.AUTOFUNDS_SFTP_HOST;
    if (!host) {
      console.error("SFTP_HOST is not set. Set it in .env.local or pass --local <file>.");
      process.exit(1);
    }

    const remoteDir =
      process.env.SFTP_REMOTE_DIR ??
      process.env.AUTOFUNDS_SFTP_REMOTE_PATH ??
      "/speedwaymotors/inventory";
    const fileName = process.env.SFTP_FILE_NAME ?? "daily_inventory.csv";
    const remotePath = `${remoteDir.replace(/\/$/, "")}/${fileName}`;

    console.log(`[test-import] connecting to SFTP ${host}${remotePath} ...`);
    csvText = await fetchCsvViaSftp({
      host,
      port: process.env.SFTP_PORT ? parseInt(process.env.SFTP_PORT, 10) : 22,
      username: process.env.SFTP_USERNAME ?? process.env.AUTOFUNDS_SFTP_USER ?? "",
      password: process.env.SFTP_PASSWORD ?? process.env.AUTOFUNDS_SFTP_PASS ?? "",
      remotePath,
    });
    console.log(`[test-import] downloaded ${csvText.length} bytes`);
  }

  console.log("[test-import] parsing CSV ...");
  const vehicles = parseAutofundsCsv(csvText);
  console.log(`[test-import] parsed ${vehicles.length} vehicles`);

  if (vehicles.length === 0) {
    console.warn("[test-import] no vehicles parsed — check the CSV format");
    process.exit(1);
  }

  // Print first 3 vehicles for inspection
  console.log("\nSample vehicles (first 3):");
  for (const v of vehicles.slice(0, 3)) {
    console.log(
      `  ${v.year} ${v.make} ${v.model} ${v.trim ?? ""} — VIN: ${v.vin} | $${v.price} | ${v.mileage} mi | ${v.images.length} images`
    );
  }

  if (!doImport) {
    console.log("\n[test-import] dry-run complete. Pass --import to write to Supabase.");
    return;
  }

  console.log("\n[test-import] importing to Supabase ...");
  const summary = await importVehicles(vehicles, false);

  console.log("\nImport summary:");
  console.log(`  Total rows parsed : ${summary.totalRows}`);
  console.log(`  Upserted          : ${summary.upserted}`);
  console.log(`  Skipped           : ${summary.skipped}`);
  console.log(`  Marked inactive   : ${summary.markedInactive}`);
  if (summary.errors.length > 0) {
    console.log(`  Errors (${summary.errors.length}):`);
    summary.errors.forEach((e) => console.log(`    - ${e}`));
  }
}

main().catch((err) => {
  console.error("[test-import] fatal:", err);
  process.exit(1);
});
