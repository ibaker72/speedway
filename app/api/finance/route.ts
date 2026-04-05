import { NextResponse } from "next/server";
import { createLead } from "@/lib/leads/store";
import { notifyLead } from "@/lib/leads/notify";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();

    if (!firstName || !lastName) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }
    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ message: "Valid email is required" }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ message: "Phone is required" }, { status: 400 });
    }

    const name = `${firstName} ${lastName}`;
    const payload = {
      firstName,
      lastName,
      employer: body.employer || null,
      jobTitle: body.jobTitle || null,
      monthlyIncome: body.monthlyIncome || null,
      residenceStatus: body.residenceStatus || null,
      vehicleType: body.vehicleType || null,
      downPayment: body.downPayment || null,
      monthlyBudget: body.monthlyBudget || null,
    };

    const lead = await createLead({
      source: "finance",
      name,
      email,
      phone,
      payload,
    });

    await notifyLead({ source: "finance", name, email, phone, payload });

    return NextResponse.json({ ok: true, leadId: lead.id });
  } catch (err) {
    console.error("Finance form error:", err);
    return NextResponse.json({ message: "Unable to process your request right now." }, { status: 500 });
  }
}
