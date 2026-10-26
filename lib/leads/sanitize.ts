/**
 * Input cleaning shared by lead API routes and client-side forms. Kept free
 * of server-only imports so client components can use the same rules.
 */

export const LEAD_FIELD_LIMITS = {
  name: 100,
  email: 254,
  phone: 30,
  short: 120,
  message: 2000,
} as const;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Coerces untrusted input to a trimmed, length-capped string with control
 * characters removed. Newlines are kept only when `multiline` is set.
 */
export function cleanText(value: unknown, max: number, { multiline = false } = {}): string {
  if (value === null || value === undefined) return "";
  const text = typeof value === "string" || typeof value === "number" ? String(value) : "";
  const stripped = multiline
    ? text.replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, "")
    : text.replace(/[\u0000-\u001F\u007F]/g, " ");
  return stripped.trim().slice(0, max);
}

export function cleanEmail(value: unknown): string {
  return cleanText(value, LEAD_FIELD_LIMITS.email).toLowerCase();
}

/** Digits of a US phone number without a leading country code, or "" if it is not 10 digits. */
export function normalizeUsPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  return national.length === 10 ? national : "";
}
