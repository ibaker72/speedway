import { NextResponse } from "next/server";
import { EMAIL_REGEX, LEAD_FIELD_LIMITS, cleanEmail, cleanText, guardLeadRequest, readJsonBody } from "@/lib/leads/guard";
import { leadFailureResponse, leadSuccessResponse, submitLead } from "@/lib/leads/submit";

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (!body) return NextResponse.json({ message: "Invalid request" }, { status: 400 });

  const blocked = guardLeadRequest(request, body, "trade-in");
  if (blocked) return blocked;

  const name = cleanText(body.name, LEAD_FIELD_LIMITS.name);
  const email = cleanEmail(body.email);
  const phone = cleanText(body.phone, LEAD_FIELD_LIMITS.phone);

  if (!name) {
    return NextResponse.json({ message: "Name is required" }, { status: 400 });
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ message: "Valid email is required" }, { status: 400 });
  }
  if (!phone) {
    return NextResponse.json({ message: "Phone is required" }, { status: 400 });
  }

  const optional = (key: string) => cleanText(body[key], LEAD_FIELD_LIMITS.short) || null;
  const payload = {
    year: optional("year"),
    make: optional("make"),
    model: optional("model"),
    mileage: optional("mileage"),
    condition: optional("condition"),
    notes: cleanText(body.notes, LEAD_FIELD_LIMITS.message, { multiline: true }) || null,
  };

  const result = await submitLead({ source: "trade-in", name, email, phone, payload });
  return result.ok ? leadSuccessResponse(result) : leadFailureResponse();
}
