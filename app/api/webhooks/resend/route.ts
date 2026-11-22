import { NextResponse } from "next/server";
import { supabaseInsert, supabaseQuery, supabaseUpdate } from "@/lib/supabase";
import { DELIVERY_EVENTS, deliveryRank, verifyResendWebhook } from "@/lib/leads/resend-webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface AttemptRef {
  id: string;
  lead_id: string;
  delivery_status: string | null;
}

/**
 * Resend delivery events for lead notifications (configure in Resend →
 * Webhooks with this URL and set RESEND_WEBHOOK_SECRET). Records whether the
 * accepted email was actually delivered; a bounce or failure flags the lead's
 * notification as failed in the dashboard. Each event is processed once.
 */
export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ message: "Webhook not configured" }, { status: 503 });

  const rawBody = await request.text();
  const verified = verifyResendWebhook(rawBody, request.headers, secret);
  if (!verified.ok) {
    console.warn(`[resend-webhook] rejected: ${verified.reason}`);
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  let event: { type?: unknown; data?: { email_id?: unknown } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }
  const type = typeof event.type === "string" ? event.type : "";
  const emailId = typeof event.data?.email_id === "string" ? event.data.email_id : null;

  // Duplicate deliveries of the same event (Svix retries) are acknowledged and ignored.
  const recorded = await supabaseInsert<{ svix_id: string }>(
    "resend_webhook_events",
    { svix_id: verified.id, event_type: type.slice(0, 64), email_id: emailId },
    { onConflict: "svix_id", prefer: "return=representation,resolution=ignore-duplicates", idempotent: true }
  );
  if (recorded.error) return NextResponse.json({ message: "Temporarily unavailable" }, { status: 503 }); // Resend retries later
  if (!recorded.data?.length) return NextResponse.json({ ok: true, duplicate: true });

  const mapping = DELIVERY_EVENTS[type];
  if (!mapping || !emailId) return NextResponse.json({ ok: true, ignored: true });

  const { data: attempts, error } = await supabaseQuery<AttemptRef>(
    "lead_notification_attempts",
    new URLSearchParams({ select: "id,lead_id,delivery_status", provider_message_id: `eq.${emailId}`, limit: "1" })
  );
  if (error) return NextResponse.json({ message: "Temporarily unavailable" }, { status: 503 });
  const attempt = attempts?.[0];
  if (!attempt) return NextResponse.json({ ok: true, ignored: true }); // not a lead notification

  if (mapping.rank >= deliveryRank(attempt.delivery_status)) {
    const now = new Date().toISOString();
    await supabaseUpdate("lead_notification_attempts", new URLSearchParams({ id: `eq.${attempt.id}` }), { delivery_status: mapping.status, delivery_updated_at: now }, { idempotent: true });
    if (mapping.undelivered) {
      await supabaseUpdate(
        "leads",
        new URLSearchParams({ id: `eq.${attempt.lead_id}` }),
        { notification_status: "failed", notification_next_attempt_at: null, notification_last_error: `Resend reported the email ${mapping.status} after accepting it` },
        { idempotent: true }
      );
      console.error(`[leads] ALERT notification ${mapping.status}: lead=${attempt.lead_id} — open /admin/leads to follow up`);
    }
  }
  return NextResponse.json({ ok: true });
}
