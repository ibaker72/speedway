import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { updateLead } from "@/lib/deal-desk/store";

export async function PATCH(request: Request, context: RouteContext<'/api/admin/deal-desk/leads/[id]/status'>) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as Record<string, unknown>;
  const updated = await updateLead(id, {
    status: body.status ? String(body.status) as never : undefined,
    assignedRep: body.assignedRep ? String(body.assignedRep) : undefined,
    followUpPriority: typeof body.followUpPriority === "number" ? body.followUpPriority : undefined,
  });
  if (!updated) return NextResponse.json({ message: "Lead not found" }, { status: 404 });
  return NextResponse.json({ ok: true, lead: updated });
}
