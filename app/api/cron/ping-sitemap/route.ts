import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

/**
 * Weekly cron: ping Google & Bing with the updated sitemap.
 * Scheduled: every Monday at 5:00 AM UTC (after geo refresh completes)
 */

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.speedwaymotorsllc.com";
  const sitemapUrl = encodeURIComponent(`${siteUrl}/sitemap.xml`);

  // Revalidate sitemap so it regenerates fresh before pinging
  revalidatePath("/sitemap.xml");

  const pings = await Promise.allSettled([
    fetch(`https://www.google.com/ping?sitemap=${sitemapUrl}`),
    fetch(`https://www.bing.com/ping?sitemap=${sitemapUrl}`),
  ]);

  const results = pings.map((p, i) => ({
    engine: i === 0 ? "google" : "bing",
    status: p.status === "fulfilled" ? p.value.status : "error",
    ...(p.status === "rejected" && { error: String(p.reason) }),
  }));

  console.log("[cron/ping-sitemap] results:", results);

  return NextResponse.json({ ok: true, results });
}
