import { NextResponse } from "next/server";
import { parseLeadAttribution } from "@/lib/leads/attribution";
import { guardLeadRequest, readJsonBody } from "@/lib/leads/guard";
import { leadFailureResponse, leadSuccessResponse, submitLead } from "@/lib/leads/submit";
import { resolveLeadVehicle } from "@/lib/leads/vehicle-reference";
import {
  VEHICLE_INQUIRY_CONSENT_TEXT,
  VEHICLE_INQUIRY_LABELS,
  normalizeVehicleInquiry,
  validateVehicleInquiry,
} from "@/lib/leads/vehicle-inquiry";

/**
 * Availability, question, and financing-information inquiries from vehicle
 * detail pages. Uses the shared lead pipeline: honeypot + rate limit
 * (guardLeadRequest), the `leads` table, and the sales email notification.
 */
export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (!body) return NextResponse.json({ message: "Invalid request" }, { status: 400 });

  const blocked = guardLeadRequest(request, body, "vehicle-inquiry");
  if (blocked) return blocked;

  const inquiry = normalizeVehicleInquiry(body);
  const errors = validateVehicleInquiry(inquiry);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ message: "Please correct the highlighted fields.", errors }, { status: 400 });
  }

  const vehicle = await resolveLeadVehicle(inquiry.vehicleSlug);
  const submittedAt = new Date().toISOString();

  const result = await submitLead({
    source: "vehicle-inquiry",
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone,
    payload: {
      inquiryType: inquiry.inquiryType,
      inquiryLabel: VEHICLE_INQUIRY_LABELS[inquiry.inquiryType],
      vehicleOfInterest: vehicle?.title ?? null,
      vehicle,
      message: inquiry.message || null,
      preferredContact: inquiry.preferredContact,
      consentToContact: true,
      consentText: VEHICLE_INQUIRY_CONSENT_TEXT,
      consentedAt: submittedAt,
      submittedAt,
      leadSource: parseLeadAttribution(body),
    },
  });

  return result.ok ? leadSuccessResponse(result) : leadFailureResponse();
}
