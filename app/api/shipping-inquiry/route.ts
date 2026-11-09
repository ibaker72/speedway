import { NextResponse } from "next/server";
import { dealerConfig } from "@/dealer.config";
import { parseLeadAttribution } from "@/lib/leads/attribution";
import { guardLeadRequest, readJsonBody } from "@/lib/leads/guard";
import { leadFailureResponse, leadSuccessResponse, submitLead } from "@/lib/leads/submit";
import { resolveLeadVehicle } from "@/lib/leads/vehicle-reference";
import { hasTooManyLinks } from "@/lib/leads/vehicle-inquiry";
import {
  SHIPPING_CONSENT_TEXT,
  normalizeShippingInquiry,
  validateShippingInquiry,
} from "@/lib/shipping/inquiry";

export async function POST(request: Request) {
  if (!dealerConfig.features.nationwideShipping) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const body = await readJsonBody(request);
  if (!body) return NextResponse.json({ message: "Invalid request" }, { status: 400 });

  const blocked = guardLeadRequest(request, body, "shipping");
  if (blocked) return blocked;

  const inquiry = normalizeShippingInquiry(body);
  const errors = validateShippingInquiry(inquiry);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ message: "Please correct the highlighted fields.", errors }, { status: 400 });
  }

  if (hasTooManyLinks(inquiry.message)) {
    return NextResponse.json(
      { message: "Please correct the highlighted fields.", errors: { message: "Please remove links from your message." } },
      { status: 400 }
    );
  }

  // Resolved on the server so the stored association reflects the real
  // listing (ID, title, stock number, VIN, price) rather than client input.
  const vehicle = await resolveLeadVehicle(inquiry.vehicleSlug);
  const submittedAt = new Date().toISOString();

  const result = await submitLead({
    source: "shipping",
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone,
    payload: {
      vehicleOfInterest: vehicle?.title || inquiry.vehicleOfInterest,
      vehicle,
      deliveryZip: inquiry.deliveryZip,
      deliveryState: inquiry.deliveryState,
      message: inquiry.message || null,
      consentToContact: true,
      consentText: SHIPPING_CONSENT_TEXT,
      consentedAt: submittedAt,
      submittedAt,
      leadSource: parseLeadAttribution(body),
    },
  });

  return result.ok ? leadSuccessResponse(result) : leadFailureResponse();
}
