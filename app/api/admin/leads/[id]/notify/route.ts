import { cleanActor, sendLeadNotificationNow } from "@/lib/leads/admin-store";
import { noStoreJson, readAdminWrite } from "@/lib/leads/admin-request";

export const maxDuration = 30;

/**
 * Staff-initiated send of the sales notification for one lead (e.g. a lead
 * that arrived before email delivery worked). Body: { actor }.
 * Responds with whether Resend accepted it — acceptance, not delivery.
 */
export async function POST(request: Request, context: RouteContext<"/api/admin/leads/[id]/notify">) {
  const read = await readAdminWrite(request);
  if ("response" in read) return read.response;
  const { id } = await context.params;
  const result = await sendLeadNotificationNow(id, cleanActor(read.body.actor));
  if (!result.ok) return noStoreJson({ message: result.message }, result.status);
  return noStoreJson({ ok: true, notification: result.outcome?.status });
}
