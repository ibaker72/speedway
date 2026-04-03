import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, getAdminPassword } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;
  const password = String(body.password || "");
  if (password !== getAdminPassword()) {
    return NextResponse.json({ message: "Invalid password" }, { status: 401 });
  }

  const store = await cookies();
  store.set(COOKIE_NAME, password, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return NextResponse.json({ ok: true });
}
