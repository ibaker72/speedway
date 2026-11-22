import { NextResponse } from "next/server";
import { isAdminAuthenticated, isSameOriginRequest } from "@/lib/admin-auth";

/**
 * Shared checks for /api/admin/leads/* writes: signed-in staff session,
 * request from this site's own pages, and a JSON object body. Returns the
 * body, or the response to send instead.
 */
export async function readAdminWrite(request: Request): Promise<{ body: Record<string, unknown> } | { response: NextResponse }> {
  if (!(await isAdminAuthenticated())) return { response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  if (!isSameOriginRequest(request)) return { response: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  try {
    const body = await request.json();
    if (body && typeof body === "object" && !Array.isArray(body)) return { body: body as Record<string, unknown> };
  } catch {
    // fall through
  }
  return { response: NextResponse.json({ message: "Invalid request" }, { status: 400 }) };
}

export function noStoreJson(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
