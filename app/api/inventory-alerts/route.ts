import { NextResponse } from "next/server";
import { createLead } from "@/lib/leads/store";
import { notifyLead } from "@/lib/leads/notify";

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

    const name = (String(body.name || "")).trim();
    const phone = (String(body.phone || "")).trim();
    const source = String(body.source || "inventory-alert");

    const payload: Record<string, unknown> = {
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
      accidents: body.accidents || null,
    };

    await createLead({ source, name, email, phone, payload });
    await notifyLead({ source, name, email, phone, payload });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Inventory alerts error:", err);
    return NextResponse.json(
      { message: "Unable to process your request right now." },
      { status: 500 },
    );
  }
}
