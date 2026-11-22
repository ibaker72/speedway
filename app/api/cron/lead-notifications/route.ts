import { NextResponse } from "next/server";
import { processDueNotifications } from "@/lib/leads/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Retries lead notifications that are due (see lib/leads/notifications.ts).
 * Scheduled in vercel.json; same CRON_SECRET check as the other cron jobs.
 * The response holds counts only — no lead or customer data.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    const urlSecret = new URL(request.url).searchParams.get("secret");
    if (authHeader !== `Bearer ${cronSecret}` && urlSecret !== cronSecret) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const summary = await processDueNotifications();
    if (summary.due > 0) console.log(`[lead-notifications] ${JSON.stringify(summary)}`);
    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    console.error(`[lead-notifications] run failed: ${err instanceof Error ? err.message : String(err)}`);
    return NextResponse.json({ ok: false, message: "Retry run failed" }, { status: 500 });
  }
}
