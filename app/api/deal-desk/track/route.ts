import { NextResponse } from "next/server";
import { createEvent } from "@/lib/deal-desk/store";
import { isRateLimited } from "@/lib/deal-desk/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (isRateLimited(`track-${ip}`, 60_000, 80)) {
    return NextResponse.json({ message: "Too many requests" }, { status: 429 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const type = String(body.type || "");
  if (!type) {
    return NextResponse.json({ message: "Event type required" }, { status: 400 });
  }

  await createEvent({
    id: crypto.randomUUID(),
    type: type as never,
    vehicleId: String(body.vehicleId || ""),
    vehicleSlug: String(body.vehicleSlug || ""),
    leadId: body.leadId ? String(body.leadId) : undefined,
    sessionId: String(body.sessionId || "anon"),
    metadata: (body.metadata || {}) as Record<string, unknown>,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
