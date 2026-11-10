import { EMAIL_REGEX, LEAD_FIELD_LIMITS, cleanEmail, cleanText, normalizeUsPhone } from "@/lib/leads/sanitize";

/**
 * Vehicle detail page inquiries: availability checks, questions, and
 * financing information requests. Shared by the client form (instant
 * feedback) and /api/vehicle-inquiry (authoritative check). Shipping quotes
 * use the existing shipping workflow (lib/shipping/inquiry.ts).
 */

export const VEHICLE_INQUIRY_TYPES = ["availability", "question", "financing"] as const;
export type VehicleInquiryType = (typeof VEHICLE_INQUIRY_TYPES)[number];

export const VEHICLE_INQUIRY_LABELS: Record<VehicleInquiryType, string> = {
  availability: "Check availability",
  question: "Question about this vehicle",
  financing: "Financing information",
};

export const VEHICLE_INQUIRY_CONSENT_TEXT =
  "I agree that Speedway Motors may contact me by phone or email about this vehicle. Consent is not a condition of purchase.";

export interface VehicleInquiry {
  inquiryType: VehicleInquiryType;
  name: string;
  email: string;
  phone: string;
  preferredContact: "email" | "phone";
  message: string;
  vehicleSlug: string;
  consent: boolean;
}

export type VehicleInquiryField = "name" | "email" | "phone" | "message" | "consent";
export type VehicleInquiryErrors = Partial<Record<VehicleInquiryField | "inquiryType" | "vehicleSlug", string>>;

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,199}$/;

/** Trims, caps, and normalizes raw input. Never throws. */
export function normalizeVehicleInquiry(raw: Record<string, unknown>): VehicleInquiry {
  const type = cleanText(raw.inquiryType, 20) as VehicleInquiryType;
  const slug = cleanText(raw.vehicleSlug, 200).toLowerCase();
  return {
    inquiryType: VEHICLE_INQUIRY_TYPES.includes(type) ? type : ("" as VehicleInquiryType),
    name: cleanText(raw.name, LEAD_FIELD_LIMITS.name),
    email: cleanEmail(raw.email),
    phone: cleanText(raw.phone, LEAD_FIELD_LIMITS.phone),
    preferredContact: raw.preferredContact === "phone" ? "phone" : "email",
    message: cleanText(raw.message, LEAD_FIELD_LIMITS.message, { multiline: true }),
    vehicleSlug: SLUG_PATTERN.test(slug) ? slug : "",
    consent: raw.consent === true || raw.consent === "true" || raw.consent === "on",
  };
}

/** Messages stuffed with links are almost always spam; real shoppers rarely paste more than one. */
export function hasTooManyLinks(text: string, max = 1): boolean {
  return (text.match(/https?:\/\/|www\.|\[url|<a\s/gi) ?? []).length > max;
}

export function validateVehicleInquiry(input: VehicleInquiry): VehicleInquiryErrors {
  const errors: VehicleInquiryErrors = {};
  if (!input.inquiryType) errors.inquiryType = "Choose what you'd like to ask about.";
  if (!input.vehicleSlug) errors.vehicleSlug = "This inquiry isn't linked to a vehicle.";
  if (input.name.length < 2) errors.name = "Please enter your name.";
  if (!input.email) errors.email = "Please enter your email address.";
  else if (!EMAIL_REGEX.test(input.email)) errors.email = "Please enter a valid email address.";
  if (input.phone && !normalizeUsPhone(input.phone)) errors.phone = "Please enter a 10-digit US phone number.";
  else if (!input.phone && input.preferredContact === "phone") errors.phone = "Please enter a phone number so we can call you.";
  if (input.inquiryType === "question" && input.message.length < 2) errors.message = "Please type your question.";
  else if (hasTooManyLinks(input.message)) errors.message = "Please remove links from your message.";
  if (!input.consent) errors.consent = "Please agree to be contacted so we can respond.";
  return errors;
}
