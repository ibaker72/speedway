import { NextResponse } from "next/server";
import { createLead } from "@/lib/leads/store";
import { notifyLead } from "@/lib/leads/notify";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const subject = String(body.subject || "").trim();
    const message = String(body.message || "").trim();

    if (!name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }
    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ message: "Valid email is required" }, { status: 400 });
    }
    if (!message) {
      return NextResponse.json({ message: "Message is required" }, { status: 400 });
    }

    const lead = await createLead({
      source: "contact",
      name,
      email,
      phone,
      payload: { subject, message },
    });

    await notifyLead({
      source: "contact",
      name,
      email,
      phone,
      payload: { subject, message },
    });

    return NextResponse.json({ ok: true, leadId: lead.id });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json({ message: "Unable to process your request right now." }, { status: 500 });
  }
}
