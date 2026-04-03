import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { addLeadNote } from "@/lib/deal-desk/store";

export async function POST(request: Request, context: RouteContext<'/api/admin/deal-desk/leads/[id]/note'>) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as Record<string, unknown>;
  const note = String(body.note || "").trim().slice(0, 1000);
  if (!note) return NextResponse.json({ message: "Note required" }, { status: 400 });

  const updated = await addLeadNote(id, {
    id: crypto.randomUUID(),
    note,
    author: String(body.author || ""),
    createdAt: new Date().toISOString(),
  });
  if (!updated) return NextResponse.json({ message: "Lead not found" }, { status: 404 });

  return NextResponse.json({ ok: true, lead: updated });
}
