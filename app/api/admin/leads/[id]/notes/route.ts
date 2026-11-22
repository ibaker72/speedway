import { addLeadNote, cleanActor, cleanNote } from "@/lib/leads/admin-store";
import { noStoreJson, readAdminWrite } from "@/lib/leads/admin-request";

/** Add an internal follow-up note to a website lead. Body: { note, actor }. */
export async function POST(request: Request, context: RouteContext<"/api/admin/leads/[id]/notes">) {
  const read = await readAdminWrite(request);
  if ("response" in read) return read.response;
  const { id } = await context.params;
  const result = await addLeadNote(id, cleanNote(read.body.note), cleanActor(read.body.actor));
  return result.ok ? noStoreJson({ ok: true }, 201) : noStoreJson({ message: result.message }, result.status);
}
