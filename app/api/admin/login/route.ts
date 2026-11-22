import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_SESSION_TTL_SECONDS, COOKIE_NAME, adminPasswordMatches, createAdminSessionToken, isSameOriginRequest } from "@/lib/admin-auth";
import { isRateLimited } from "@/lib/deal-desk/rate-limit";
import { clientIp } from "@/lib/leads/guard";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  // Slows password guessing from one address (per instance; see lib/leads/guard.ts).
  if (isRateLimited(`admin-login-${clientIp(request)}`, 10 * 60_000, 10)) {
    return NextResponse.json({ message: "Too many attempts. Try again in a few minutes." }, { status: 429 });
  }

  let password = "";
  try {
    const body = (await request.json()) as Record<string, unknown>;
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
  if (!password || !adminPasswordMatches(password)) {
    return NextResponse.json({ message: "Invalid password" }, { status: 401 });
  }

  const store = await cookies();
  store.set(COOKIE_NAME, createAdminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });
  return NextResponse.json({ ok: true });
}
