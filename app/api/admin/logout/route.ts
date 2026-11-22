import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME, isSameOriginRequest } from "@/lib/admin-auth";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  const store = await cookies();
  store.delete(COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
