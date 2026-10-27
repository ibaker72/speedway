import { NextResponse } from "next/server";
import { dealerConfig } from "@/dealer.config";
import { getVehicleBySlug } from "@/lib/data/inventory-source";
import { cleanText, guardLeadRequest, readJsonBody } from "@/lib/leads/guard";
import { leadFailureResponse, leadSuccessResponse, submitLead } from "@/lib/leads/submit";
import { absoluteUrl } from "@/lib/seo/site";
import { vehicleName, vehiclePath } from "@/lib/seo/schema";
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

  // Resolve the vehicle on the server so the stored association reflects the
  // real listing (title, stock number, VIN, price) rather than client input.
  let vehicle: Record<string, unknown> | null = null;
  if (inquiry.vehicleSlug) {
    try {
      const match = await getVehicleBySlug(inquiry.vehicleSlug);
      vehicle = match
        ? {
            slug: match.slug,
            title: vehicleName(match),
            stockNumber: match.stockNumber || null,
            vin: match.vin || null,
            price: match.price > 0 ? match.price : null,
            url: absoluteUrl(vehiclePath(match)),
          }
        : { slug: inquiry.vehicleSlug, title: null, note: "Listing not found (it may have sold)" };
    } catch {
      vehicle = { slug: inquiry.vehicleSlug, title: null, note: "Listing lookup failed" };
    }
  }

  const attribution = body.attribution && typeof body.attribution === "object" ? (body.attribution as Record<string, unknown>) : {};
  const leadSource = {
    utmSource: cleanText(attribution.utm_source, 100) || null,
    utmMedium: cleanText(attribution.utm_medium, 100) || null,
    utmCampaign: cleanText(attribution.utm_campaign, 100) || null,
    landingPage: cleanText(attribution.landing_page, 200) || null,
    referrerHost: cleanText(attribution.referrer_host, 100) || null,
    formPage: cleanText(body.formPage, 200) || null,
  };

  const result = await submitLead({
    source: "shipping",
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone,
    payload: {
      vehicleOfInterest: (vehicle?.title as string | null) || inquiry.vehicleOfInterest,
      vehicle,
      deliveryZip: inquiry.deliveryZip,
      deliveryState: inquiry.deliveryState,
      message: inquiry.message || null,
      consentToContact: true,
      consentText: SHIPPING_CONSENT_TEXT,
      consentedAt: new Date().toISOString(),
      leadSource,
    },
  });

  return result.ok ? leadSuccessResponse(result) : leadFailureResponse();
}
