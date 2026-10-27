import { NextResponse } from "next/server";
import { EMAIL_REGEX, LEAD_FIELD_LIMITS, cleanEmail, cleanText, guardLeadRequest, readJsonBody } from "@/lib/leads/guard";
import { leadFailureResponse, leadSuccessResponse, submitLead } from "@/lib/leads/submit";

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (!body) return NextResponse.json({ message: "Invalid request" }, { status: 400 });

  const blocked = guardLeadRequest(request, body, "finance");
  if (blocked) return blocked;

  const firstName = cleanText(body.firstName, LEAD_FIELD_LIMITS.name);
  const lastName = cleanText(body.lastName, LEAD_FIELD_LIMITS.name);
  const email = cleanEmail(body.email);
  const phone = cleanText(body.phone, LEAD_FIELD_LIMITS.phone);

  if (!firstName || !lastName) {
    return NextResponse.json({ message: "Name is required" }, { status: 400 });
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ message: "Valid email is required" }, { status: 400 });
  }
  if (!phone) {
    return NextResponse.json({ message: "Phone is required" }, { status: 400 });
  }

  const optional = (key: string) => cleanText(body[key], LEAD_FIELD_LIMITS.short) || null;
  const name = `${firstName} ${lastName}`;
  const payload = {
    firstName,
    lastName,
    employer: optional("employer"),
    jobTitle: optional("jobTitle"),
    monthlyIncome: optional("monthlyIncome"),
    residenceStatus: optional("residenceStatus"),
    vehicleType: optional("vehicleType"),
    downPayment: optional("downPayment"),
    monthlyBudget: optional("monthlyBudget"),
  };

  const result = await submitLead({ source: "finance", name, email, phone, payload });
  return result.ok ? leadSuccessResponse(result) : leadFailureResponse();
}
