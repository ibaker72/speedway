import { NextResponse } from "next/server";
import { isRateLimited } from "@/lib/deal-desk/rate-limit";
import { cleanText } from "@/lib/leads/sanitize";

/**
 * Shared abuse protection for public lead forms.
 *
 * Rate limiting is per serverless instance (see lib/deal-desk/rate-limit.ts),
 * so it slows down a single client hammering a warm instance but is not a
 * global guarantee. For stronger protection add a Vercel WAF rate-limit rule
 * on /api/* POST requests.
 */

export const HONEYPOT_FIELD = "website";

export { EMAIL_REGEX, LEAD_FIELD_LIMITS, cleanEmail, cleanText } from "@/lib/leads/sanitize";

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/** True when the hidden honeypot input was filled in, which real visitors never see. */
export function isHoneypotTripped(body: Record<string, unknown>): boolean {
  return cleanText(body[HONEYPOT_FIELD], 200) !== "";
}

/**
 * Returns a response to send immediately when the request should not be
 * processed (rate limited or a bot), or null to continue.
 * Honeypot hits get a normal-looking success so bots do not adapt.
 */
export function guardLeadRequest(
  request: Request,
  body: Record<string, unknown>,
  formKey: string,
  { maxRequests = 5, windowMs = 10 * 60_000 } = {}
): NextResponse | null {
  if (isHoneypotTripped(body)) {
    return NextResponse.json({ ok: true });
  }
  if (isRateLimited(`lead-${formKey}-${clientIp(request)}`, windowMs, maxRequests)) {
    return NextResponse.json(
      { message: "Too many submissions. Please wait a few minutes or call us directly." },
      { status: 429 }
    );
  }
  return null;
}

/** Parses a JSON object body, returning null for anything else. */
export async function readJsonBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
