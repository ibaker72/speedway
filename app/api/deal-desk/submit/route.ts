import { NextResponse } from "next/server";
import { computeLeadScore } from "@/lib/deal-desk/scoring";
import { createEvent, createLead, listEventsBySession } from "@/lib/deal-desk/store";
import { isRateLimited } from "@/lib/deal-desk/rate-limit";
import { validateLeadPayload } from "@/lib/deal-desk/validation";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (isRateLimited(`submit-${ip}`, 60_000, 8)) {
    return NextResponse.json({ message: "Too many submissions" }, { status: 429 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const parsed = validateLeadPayload(body);
  if (!parsed.ok) {
    return NextResponse.json({ message: parsed.message }, { status: 400 });
  }

  const leadId = crypto.randomUUID();
  const now = new Date().toISOString();
  const historicalEvents = await listEventsBySession(parsed.data.sessionId, parsed.data.vehicleId);
  const withSubmission = [
    ...historicalEvents,
    {
      id: crypto.randomUUID(),
      type: "contact_submitted" as const,
      sessionId: parsed.data.sessionId,
      vehicleId: parsed.data.vehicleId,
      vehicleSlug: parsed.data.vehicleSlug,
      createdAt: now,
    },
  ];
  const score = computeLeadScore(withSubmission as never);

  const lead = await createLead({
    id: leadId,
    requestType: parsed.data.requestType,
    status: "new",
    followUpPriority: score.score >= 60 ? 1 : score.score >= 25 ? 2 : 3,
    customer: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      preferredContactMethod: parsed.data.preferredContactMethod,
      message: parsed.data.message,
    },
    vehicle: {
      id: parsed.data.vehicleId,
      slug: parsed.data.vehicleSlug,
      stockNumber: parsed.data.stockNumber,
      title: parsed.data.vehicleTitle,
      price: parsed.data.vehiclePrice,
    },
    calculatorSnapshot: parsed.data.calculatorSnapshot,
    monthlyEstimateShown: parsed.data.monthlyEstimateShown,
    outTheDoorEstimateShown: parsed.data.outTheDoorEstimateShown,
    engagementScore: score.score,
    engagementLabel: score.label,
    utm: parsed.data.utm,
    referralSource: parsed.data.referralSource,
    sessionId: parsed.data.sessionId,
    history: [{ type: `lead_created_${parsed.data.requestType}`, at: now }],
    notes: [],
    createdAt: now,
    updatedAt: now,
  });

  await createEvent({
    id: crypto.randomUUID(),
    type: "contact_submitted",
    leadId,
    vehicleId: parsed.data.vehicleId,
    vehicleSlug: parsed.data.vehicleSlug,
    sessionId: parsed.data.sessionId,
    metadata: { requestType: parsed.data.requestType },
    createdAt: now,
  });

  await createEvent({
    id: crypto.randomUUID(),
    type:
      parsed.data.requestType === "test_drive"
        ? "test_drive_requested"
        : parsed.data.requestType === "walkaround"
          ? "walkaround_requested"
          : "save_deal_clicked",
    leadId,
    vehicleId: parsed.data.vehicleId,
    vehicleSlug: parsed.data.vehicleSlug,
    sessionId: parsed.data.sessionId,
    createdAt: now,
  });

  return NextResponse.json({ ok: true, leadId: lead.id });
}
