import { cleanActor, updateLeadStatus } from "@/lib/leads/admin-store";
import { noStoreJson, readAdminWrite } from "@/lib/leads/admin-request";

/** Change a website lead's follow-up status. Body: { status, actor }. */
export async function PATCH(request: Request, context: RouteContext<"/api/admin/leads/[id]">) {
  const read = await readAdminWrite(request);
  if ("response" in read) return read.response;
  const { id } = await context.params;
  const result = await updateLeadStatus(id, read.body.status, cleanActor(read.body.actor));
  return result.ok ? noStoreJson({ ok: true }) : noStoreJson({ message: result.message }, result.status);
}
