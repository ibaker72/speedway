import { NextResponse } from "next/server";
import { EMAIL_REGEX, LEAD_FIELD_LIMITS, cleanEmail, cleanText, guardLeadRequest, readJsonBody } from "@/lib/leads/guard";
import { leadFailureResponse, leadSuccessResponse, submitLead } from "@/lib/leads/submit";

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (!body) return NextResponse.json({ message: "Invalid request" }, { status: 400 });

  const blocked = guardLeadRequest(request, body, "contact");
  if (blocked) return blocked;

  const name = cleanText(body.name, LEAD_FIELD_LIMITS.name);
  const email = cleanEmail(body.email);
  const phone = cleanText(body.phone, LEAD_FIELD_LIMITS.phone);
  const subject = cleanText(body.subject, LEAD_FIELD_LIMITS.short);
  const message = cleanText(body.message, LEAD_FIELD_LIMITS.message, { multiline: true });

  if (!name) {
    return NextResponse.json({ message: "Name is required" }, { status: 400 });
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ message: "Valid email is required" }, { status: 400 });
  }
  if (!message) {
    return NextResponse.json({ message: "Message is required" }, { status: 400 });
  }

  const result = await submitLead({ source: "contact", name, email, phone, payload: { subject, message } });
  return result.ok ? leadSuccessResponse(result) : leadFailureResponse();
}
