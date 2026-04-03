import type { ContactPreference, DealDeskRequestType, DealSnapshot } from "@/lib/deal-desk/types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s()+.-]{7,}$/;

export function sanitizeText(value: unknown, maxLength = 500) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
}

export function validateLeadPayload(body: Record<string, unknown>) {
  const name = sanitizeText(body.name, 80);
  const email = sanitizeText(body.email, 120).toLowerCase();
  const phone = sanitizeText(body.phone, 30);
  const preferredContactMethod = sanitizeText(body.preferredContactMethod, 10) as ContactPreference;
  const requestType = sanitizeText(body.requestType, 20) as DealDeskRequestType;

  if (!name) return { ok: false as const, message: "Name is required." };
  if (!EMAIL_REGEX.test(email)) return { ok: false as const, message: "Valid email is required." };
  if (!PHONE_REGEX.test(phone)) return { ok: false as const, message: "Valid phone is required." };
  if (!["phone", "email", "text"].includes(preferredContactMethod)) {
    return { ok: false as const, message: "Preferred contact method is invalid." };
  }
  if (!["save_deal", "test_drive", "walkaround", "help"].includes(requestType)) {
    return { ok: false as const, message: "Request type is invalid." };
  }

  return {
    ok: true as const,
    data: {
      name,
      email,
      phone,
      preferredContactMethod,
      requestType,
      message: sanitizeText(body.message, 1000),
      sessionId: sanitizeText(body.sessionId, 80),
      referralSource: sanitizeText(body.referralSource, 120),
      vehicleId: sanitizeText(body.vehicleId, 80),
      vehicleSlug: sanitizeText(body.vehicleSlug, 120),
      stockNumber: sanitizeText(body.stockNumber, 80),
      vehicleTitle: sanitizeText(body.vehicleTitle, 180),
      vehiclePrice: Number(body.vehiclePrice || 0),
      monthlyEstimateShown: Number(body.monthlyEstimateShown || 0),
      outTheDoorEstimateShown: Number(body.outTheDoorEstimateShown || 0),
      utm: (body.utm || {}) as Record<string, string>,
      calculatorSnapshot: body.calculatorSnapshot as DealSnapshot,
    },
  };
}
