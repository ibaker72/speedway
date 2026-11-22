import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verifies a Resend webhook (Resend signs with Svix): HMAC-SHA256 over
 * `${svix-id}.${svix-timestamp}.${rawBody}` with the endpoint's signing secret
 * ("whsec_…", base64 after the prefix). Rejects stale timestamps (±5 minutes)
 * so a captured request cannot be replayed later.
 */
export function verifyResendWebhook(
  rawBody: string,
  headers: Headers,
  secret: string,
  nowMs = Date.now()
): { ok: true; id: string } | { ok: false; reason: string } {
  const id = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signatures = headers.get("svix-signature");
  if (!id || !timestamp || !signatures) return { ok: false, reason: "missing signature headers" };

  const seconds = Number(timestamp);
  if (!Number.isFinite(seconds) || Math.abs(nowMs / 1000 - seconds) > 5 * 60) return { ok: false, reason: "timestamp outside tolerance" };

  let key: Buffer;
  try {
    key = Buffer.from(secret.startsWith("whsec_") ? secret.slice(6) : secret, "base64");
  } catch {
    return { ok: false, reason: "invalid secret" };
  }
  const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${rawBody}`).digest();

  for (const part of signatures.split(" ")) {
    const [version, value] = part.split(",");
    if (version !== "v1" || !value) continue;
    const candidate = Buffer.from(value, "base64");
    if (candidate.length === expected.length && timingSafeEqual(candidate, expected)) return { ok: true, id };
  }
  return { ok: false, reason: "signature mismatch" };
}

/** Resend event → delivery status stored on the attempt; later states never go backwards. */
export const DELIVERY_EVENTS: Record<string, { status: string; rank: number; undelivered?: boolean }> = {
  "email.sent": { status: "sent", rank: 1 },
  "email.delivery_delayed": { status: "delayed", rank: 2 },
  "email.delivered": { status: "delivered", rank: 3 },
  "email.complained": { status: "complained", rank: 4 },
  "email.bounced": { status: "bounced", rank: 4, undelivered: true },
  "email.failed": { status: "failed", rank: 4, undelivered: true },
};

export function deliveryRank(status: string | null | undefined): number {
  return Object.values(DELIVERY_EVENTS).find((e) => e.status === status)?.rank ?? 0;
}
