import { NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ProxyAgent, fetch: undiciFetch } = require("undici") as typeof import("undici");
import { parseAutofundsCsv } from "@/lib/feed/autofunds-parser";

/**
 * Fetch feedUrl through a Fixie static-IP proxy when FIXIE_URL is set.
 * Fixie provides a stable egress IP so AutoFunds can whitelist it.
 * Set FIXIE_URL=http://fixie:<token>@speedboat.usefixie.com:80 in Vercel env.
 * Without FIXIE_URL, falls back to normal fetch (dynamic Vercel IP).
 */
async function fetchFeed(feedUrl: string): Promise<Response> {
  const fixieUrl = process.env.FIXIE_URL;
  if (fixieUrl) {
    const dispatcher = new ProxyAgent(fixieUrl);
    // undici fetch accepts `dispatcher` as an extended RequestInit option
    return undiciFetch(feedUrl, { dispatcher, cache: "no-store" } as Parameters<typeof undiciFetch>[1]) as unknown as Response;
  }
  return fetch(feedUrl, { cache: "no-store" });
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
  }

  const feedUrl = process.env.AUTOFUNDS_FEED_URL;
  if (!feedUrl) {
    return NextResponse.json({ message: "AUTOFUNDS_FEED_URL not configured" }, { status: 500 });
  }

  let csvText: string;
  try {
    const feedRes = await fetchFeed(feedUrl);
    if (!feedRes.ok) {
      return NextResponse.json(
        { message: `AutoFunds feed returned HTTP ${feedRes.status}` },
        { status: 502 }
      );
    }
    csvText = await feedRes.text();
  } catch (err) {
    return NextResponse.json(
      { message: `Failed to fetch AutoFunds feed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 502 }
    );
  }

  const vehicles = parseAutofundsCsv(csvText);

  if (vehicles.length === 0) {
    return NextResponse.json({ message: "No vehicles parsed from feed" }, { status: 422 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.speedwaymotorsllc.com";
  const ingestRes = await fetch(`${baseUrl}/api/inventory/ingest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.INVENTORY_API_KEY ?? ""}`,
    },
    body: JSON.stringify({ vehicles }),
  });

  const result = await ingestRes.json();

  console.log(
    `[cron/sync-autofunds] parsed=${vehicles.length} inserted=${result.inserted} updated=${result.updated} deactivated=${result.deactivated} errors=${result.errors?.length ?? 0}`
  );

  return NextResponse.json({
    ok: ingestRes.ok,
    parsed: vehicles.length,
    ...result,
  });
}
