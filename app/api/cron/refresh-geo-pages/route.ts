import { NextResponse } from "next/server";
import { geoLocations } from "@/lib/geo/locations";

/**
 * Weekly cron: regenerate all geo landing pages via OpenClaw.
 * Scheduled: every Monday at 4:00 AM UTC (vercel.json)
 *
 * Vercel calls this with the CRON_SECRET in the Authorization header.
 * The handler forwards each city to /api/generate-city-page with a stagger
 * to avoid rate-limiting the OpenClaw API.
 */

const STAGGER_MS = 3000;

export async function GET(request: Request) {
  // Verify Vercel cron secret
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.speedwaymotorsllc.com";
  const results: { slug: string; status: "ok" | "error"; error?: string }[] = [];

  for (let i = 0; i < geoLocations.length; i++) {
    const loc = geoLocations[i];

    if (i > 0) {
      await new Promise((r) => setTimeout(r, STAGGER_MS));
    }

    try {
      const res = await fetch(`${baseUrl}/api/generate-city-page`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Pass the admin cookie is not possible in cron — use an internal secret instead
          "x-cron-secret": process.env.CRON_SECRET ?? "",
        },
        body: JSON.stringify({ city: loc.city, state: loc.state }),
      });

      results.push({
        slug: loc.slug,
        status: res.ok ? "ok" : "error",
        ...(!res.ok && { error: `HTTP ${res.status}` }),
      });
    } catch (err) {
      results.push({
        slug: loc.slug,
        status: "error",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const succeeded = results.filter((r) => r.status === "ok").length;
  console.log(`[cron/refresh-geo-pages] ${succeeded}/${geoLocations.length} pages refreshed`);

  return NextResponse.json({
    ok: true,
    succeeded,
    total: geoLocations.length,
    results,
  });
}
