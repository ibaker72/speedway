import { EMAIL_REGEX, LEAD_FIELD_LIMITS, cleanEmail, cleanText, normalizeUsPhone } from "@/lib/leads/sanitize";

/**
 * Shipping inquiry fields and validation. Used by the client form for instant
 * feedback and by /api/shipping-inquiry as the authoritative check.
 */

export const US_STATES: { code: string; name: string }[] = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" }, { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" }, { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" }, { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" }, { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" }, { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" }, { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" }, { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" }, { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" }, { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" }, { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" }, { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" }, { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" }, { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" }, { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" }, { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" }, { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" }, { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" },
];

const STATE_CODES = new Set(US_STATES.map((state) => state.code));

export const SHIPPING_CONSENT_TEXT =
  "I agree that Speedway Motors may contact me by phone or email about this shipping inquiry. Consent is not a condition of purchase.";

export interface ShippingInquiry {
  name: string;
  email: string;
  phone: string;
  vehicleOfInterest: string;
  /** Inventory slug when the inquiry started from a vehicle page. */
  vehicleSlug: string;
  deliveryZip: string;
  deliveryState: string;
  message: string;
  consent: boolean;
}

export type ShippingInquiryField = Exclude<keyof ShippingInquiry, "vehicleSlug">;
export type ShippingInquiryErrors = Partial<Record<ShippingInquiryField, string>>;

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,199}$/;

/** Trims, caps, and normalizes raw input. Never throws. */
export function normalizeShippingInquiry(raw: Record<string, unknown>): ShippingInquiry {
  const slug = cleanText(raw.vehicleSlug, 200).toLowerCase();
  return {
    name: cleanText(raw.name, LEAD_FIELD_LIMITS.name),
    email: cleanEmail(raw.email),
    phone: cleanText(raw.phone, LEAD_FIELD_LIMITS.phone),
    vehicleOfInterest: cleanText(raw.vehicleOfInterest, 200),
    vehicleSlug: SLUG_PATTERN.test(slug) ? slug : "",
    deliveryZip: cleanText(raw.deliveryZip, 10),
    deliveryState: cleanText(raw.deliveryState, 2).toUpperCase(),
    message: cleanText(raw.message, LEAD_FIELD_LIMITS.message, { multiline: true }),
    consent: raw.consent === true || raw.consent === "true" || raw.consent === "on",
  };
}

export function validateShippingInquiry(input: ShippingInquiry): ShippingInquiryErrors {
  const errors: ShippingInquiryErrors = {};
  if (input.name.length < 2) errors.name = "Please enter your full name.";
  if (!input.email) errors.email = "Please enter your email address.";
  else if (!EMAIL_REGEX.test(input.email)) errors.email = "Please enter a valid email address.";
  if (!input.phone) errors.phone = "Please enter your phone number.";
  else if (!normalizeUsPhone(input.phone)) errors.phone = "Please enter a 10-digit US phone number.";
  if (!input.vehicleOfInterest) errors.vehicleOfInterest = "Tell us which vehicle you're interested in.";
  if (!input.deliveryZip) errors.deliveryZip = "Please enter the delivery ZIP code.";
  else if (!/^\d{5}(-\d{4})?$/.test(input.deliveryZip)) errors.deliveryZip = "Please enter a valid 5-digit ZIP code.";
  if (!input.deliveryState) errors.deliveryState = "Please choose the delivery state.";
  else if (!STATE_CODES.has(input.deliveryState)) errors.deliveryState = "Please choose a valid US state.";
  if (!input.consent) errors.consent = "Please agree to be contacted so we can respond to your inquiry.";
  return errors;
}
