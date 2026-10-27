import { NextResponse } from "next/server";
import { EMAIL_REGEX, LEAD_FIELD_LIMITS, cleanEmail, cleanText, guardLeadRequest, readJsonBody } from "@/lib/leads/guard";
import { leadFailureResponse, leadSuccessResponse, submitLead } from "@/lib/leads/submit";

// Forms that post here identify themselves with one of these sources.
const ALLOWED_SOURCES = new Set([
  "inventory-alert",
  "alerts-page",
  "price-drop",
  "inventory-bar",
  "homepage-modal",
  "value-my-car",
  "buying-guide",
]);

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (!body) return NextResponse.json({ message: "Invalid request" }, { status: 400 });

  const blocked = guardLeadRequest(request, body, "inventory-alerts");
  if (blocked) return blocked;

  const email = cleanEmail(body.email);
  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { message: "Please provide a valid email address." },
      { status: 400 },
    );
  }

  const name = cleanText(body.name, LEAD_FIELD_LIMITS.name);
  const phone = cleanText(body.phone, LEAD_FIELD_LIMITS.phone);
  const requestedSource = cleanText(body.source, 40);
  const source = ALLOWED_SOURCES.has(requestedSource) ? requestedSource : "inventory-alert";

  const optional = (key: string) => cleanText(body[key], LEAD_FIELD_LIMITS.short) || null;
  const filters = body.filters && typeof body.filters === "object" && !Array.isArray(body.filters)
    ? Object.fromEntries(
        Object.entries(body.filters as Record<string, unknown>)
          .slice(0, 10)
          .map(([key, value]) => [cleanText(key, 40), cleanText(value, LEAD_FIELD_LIMITS.short)])
      )
    : null;

  const payload: Record<string, unknown> = {
    filters,
    vehicleSlug: optional("vehicleSlug"),
    vehicleTitle: optional("vehicleTitle"),
    currentPrice: optional("currentPrice"),
    vehicleInterest: optional("vehicleInterest"),
    vehicleYear: optional("vehicleYear"),
    vehicleMake: optional("vehicleMake"),
    vehicleModel: optional("vehicleModel"),
    mileage: optional("mileage"),
    condition: optional("condition"),
    accidents: optional("accidents"),
  };

  const result = await submitLead({ source, name, email, phone, payload });
  return result.ok ? leadSuccessResponse(result) : leadFailureResponse();
}
