/**
 * One-time repair: rewrite decommissioned AutoFunds image hosts
 * (InvImg*.autofunds.net — retired June 2026, now 404 on every path) to
 * images.autofunds.net, which serves the identical paths, in
 * inventory.thumbnail_url and inventory.images[].url.
 *
 * - Idempotent: only rows still referencing a legacy host are touched;
 *   a second run reports 0 changes.
 * - Dry-run by default; pass --apply to write.
 * - Only the hostname is rewritten — paths, query strings, ordering, and
 *   rows without legacy hosts are left untouched. Nothing is deleted.
 * - Logs counts only.
 *
 * Usage:
 *   npx tsx scripts/repair-image-hosts.ts            # dry-run (no writes)
 *   npx tsx scripts/repair-image-hosts.ts --apply    # write changes
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * (read from .env.local if present).
 */

import { config } from "dotenv";
config({ path: ".env.local" });

const LEGACY_HOST = /^(https?):\/\/invimg[a-z0-9]*\.autofunds\.net\//i;
const REPLACEMENT_PREFIX = "https://images.autofunds.net/";

const apply = process.argv.includes("--apply");

interface InventoryRow {
  id: string;
  thumbnail_url: string | null;
  images: unknown;
}

function rewriteUrl(url: unknown): { value: string; changed: boolean } | null {
  if (typeof url !== "string") return null;
  if (!LEGACY_HOST.test(url)) return { value: url, changed: false };
  return { value: url.replace(LEGACY_HOST, REPLACEMENT_PREFIX), changed: true };
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.");
    process.exit(1);
  }
  const headers = { apikey: key, Authorization: `Bearer ${key}` };

  console.log(`[repair-image-hosts] mode: ${apply ? "APPLY" : "dry-run"}`);

  const rows: InventoryRow[] = [];
  const PAGE = 500;
  for (let offset = 0; ; offset += PAGE) {
    const res = await fetch(
      `${url}/rest/v1/inventory?select=id,thumbnail_url,images&limit=${PAGE}&offset=${offset}`,
      { headers }
    );
    if (!res.ok) {
      console.error(`[repair-image-hosts] fetch failed: ${res.status}`);
      process.exit(1);
    }
    const page = (await res.json()) as InventoryRow[];
    rows.push(...page);
    if (page.length < PAGE) break;
  }
  console.log(`[repair-image-hosts] scanned ${rows.length} inventory rows`);

  let rowsChanged = 0;
  let thumbsChanged = 0;
  let imageUrlsChanged = 0;
  let updateFailures = 0;

  for (const row of rows) {
    const patch: Record<string, unknown> = {};

    const thumb = rewriteUrl(row.thumbnail_url);
    if (thumb?.changed) {
      patch.thumbnail_url = thumb.value;
      thumbsChanged++;
    }

    if (Array.isArray(row.images)) {
      let changedInRow = 0;
      const nextImages = row.images.map((img) => {
        if (img && typeof img === "object") {
          const obj = img as Record<string, unknown>;
          const rewritten = rewriteUrl(obj.url);
          if (rewritten?.changed) {
            changedInRow++;
            return { ...obj, url: rewritten.value };
          }
        }
        return img;
      });
      if (changedInRow > 0) {
        patch.images = nextImages;
        imageUrlsChanged += changedInRow;
      }
    }

    if (Object.keys(patch).length === 0) continue;
    rowsChanged++;

    if (apply) {
      const res = await fetch(`${url}/rest/v1/inventory?id=eq.${encodeURIComponent(row.id)}`, {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        updateFailures++;
        console.error(`[repair-image-hosts] update failed for one row: ${res.status}`);
      }
    }
  }

  console.log(
    `[repair-image-hosts] rows needing repair: ${rowsChanged} ` +
      `(thumbnails: ${thumbsChanged}, image entries: ${imageUrlsChanged})`
  );
  if (apply) {
    console.log(
      `[repair-image-hosts] applied updates to ${rowsChanged - updateFailures}/${rowsChanged} rows` +
        (updateFailures > 0 ? ` — ${updateFailures} FAILED` : "")
    );
    process.exit(updateFailures > 0 ? 1 : 0);
  } else {
    console.log("[repair-image-hosts] dry-run complete — re-run with --apply to write");
  }
}

main().catch((err) => {
  console.error("[repair-image-hosts] fatal:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
