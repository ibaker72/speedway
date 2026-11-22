import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "speedway_admin_session";

/** Staff sessions last one working day. */
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8;

export function getAdminPassword() {
  const password = process.env.DEAL_DESK_ADMIN_PASSWORD;
  if (!password) {
    throw new Error("DEAL_DESK_ADMIN_PASSWORD environment variable must be set. No default password is allowed in production.");
  }
  return password;
}

/** Signing key for session tokens: ADMIN_SESSION_SECRET if set, else the admin password (rotating it signs everyone out). */
function sessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || getAdminPassword();
}

function sign(expiresAt: number): Buffer {
  return createHmac("sha256", sessionSecret()).update(`speedway-admin-session:v1:${expiresAt}`).digest();
}

/**
 * The session cookie holds `v1.<expiry>.<HMAC>` — never the password — so a
 * leaked cookie expires on its own and does not reveal the password.
 */
export function createAdminSessionToken(nowMs = Date.now()): string {
  const expiresAt = Math.floor(nowMs / 1000) + ADMIN_SESSION_TTL_SECONDS;
  return `v1.${expiresAt}.${sign(expiresAt).toString("base64url")}`;
}

export function verifyAdminSessionToken(token: string | undefined, nowMs = Date.now()): boolean {
  if (!token) return false;
  const [version, expiry, signature] = token.split(".");
  if (version !== "v1" || !expiry || !signature || !/^\d{1,12}$/.test(expiry)) return false;
  const expiresAt = Number(expiry);
  if (expiresAt <= Math.floor(nowMs / 1000)) return false;
  const given = Buffer.from(signature, "base64url");
  const expected = sign(expiresAt);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** Constant-time password comparison (hashing first equalizes lengths). */
export function adminPasswordMatches(candidate: string): boolean {
  const a = createHash("sha256").update(candidate).digest();
  const b = createHash("sha256").update(getAdminPassword()).digest();
  return timingSafeEqual(a, b);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get(COOKIE_NAME)?.value);
}

/**
 * Admin write requests must come from this site's own pages. Blocks
 * cross-site form posts riding on a signed-in staff member's cookie.
 */
export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return request.headers.get("sec-fetch-site") !== "cross-site";
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return Boolean(host) && new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Only same-site admin paths are allowed as a post-login destination. */
export function safeAdminRedirect(next: unknown): string {
  return typeof next === "string" && /^\/admin(\/[A-Za-z0-9\-_/]*)?$/.test(next) && next !== "/admin/login" ? next : "/admin/leads";
}

export { COOKIE_NAME };
