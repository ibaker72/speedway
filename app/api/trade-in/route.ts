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

    if (!name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }
    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ message: "Valid email is required" }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ message: "Phone is required" }, { status: 400 });
    }

    const payload = {
      year: body.year || null,
      make: body.make || null,
      model: body.model || null,
      mileage: body.mileage || null,
      condition: body.condition || null,
      notes: body.notes || null,
    };

    const lead = await createLead({
      source: "trade-in",
      name,
      email,
      phone,
      payload,
    });

    await notifyLead({ source: "trade-in", name, email, phone, payload });

    return NextResponse.json({ ok: true, leadId: lead.id });
  } catch (err) {
    console.error("Trade-in form error:", err);
    return NextResponse.json({ message: "Unable to process your request right now." }, { status: 500 });
  }
}
