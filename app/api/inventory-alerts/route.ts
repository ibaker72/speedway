import { NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = (String(body.email || "")).trim().toLowerCase();

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { message: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    const payload = {
      email,
      name: (String(body.name || "")).trim(),
      phone: (String(body.phone || "")).trim(),
      source: body.source || "unknown",
      filters: body.filters || null,
      vehicleSlug: body.vehicleSlug || null,
      vehicleTitle: body.vehicleTitle || null,
      currentPrice: body.currentPrice || null,
      vehicleInterest: body.vehicleInterest || null,
      vehicleYear: body.vehicleYear || null,
      vehicleMake: body.vehicleMake || null,
      vehicleModel: body.vehicleModel || null,
      mileage: body.mileage || null,
      condition: body.condition || null,
      createdAt: new Date().toISOString(),
    };

    // TODO: Connect this endpoint to your email provider/CRM (e.g., Klaviyo, Mailchimp, HubSpot).
    console.info("Lead capture", payload);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { message: "Unable to process your request right now." },
      { status: 500 },
    );
  }
}
