import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

/**
 * Weekly cron (Mondays 5:00 AM UTC): refresh the cached sitemap.
 *
 * The old Google (google.com/ping) and Bing (bing.com/ping) sitemap ping
 * endpoints were retired by both search engines, so they are no longer
 * called. Search engines discover sitemap changes from robots.txt and from
 * the sitemap submitted in Google Search Console / Bing Webmaster Tools.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  revalidatePath("/sitemap.xml");
  return NextResponse.json({ ok: true, revalidated: "/sitemap.xml" });
}
