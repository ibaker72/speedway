import { NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { email?: string; source?: string };
    const email = (payload.email || "").trim().toLowerCase();

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { message: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    // TODO: Connect this endpoint to your email provider/CRM (e.g., Klaviyo, Mailchimp, HubSpot).
    console.info("Inventory alert signup", {
      email,
      source: payload.source || "unknown",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { message: "Unable to process your request right now." },
      { status: 500 },
    );
  }
}
