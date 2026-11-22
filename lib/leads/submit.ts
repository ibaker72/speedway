import { NextResponse } from "next/server";
import { createLead, type Lead } from "@/lib/leads/store";
import { notifyLead } from "@/lib/leads/notify";
import { deliverLeadNotification } from "@/lib/leads/notifications";
import { BUSINESS } from "@/lib/constants";

export interface LeadSubmission {
  source: string;
  name?: string;
  email?: string;
  phone?: string;
  payload?: Record<string, unknown>;
}

export interface LeadSubmissionResult {
  ok: boolean;
  leadId?: string;
  stored: boolean;
  /** Resend accepted the sales email during this request. */
  notified: boolean;
  /**
   * sent   — accepted by Resend now
   * queued — stored; not accepted yet, the retry job will try again
   * failed — not accepted and nothing will retry it (untracked fallback)
   */
  notification: "sent" | "queued" | "failed";
}

/**
 * Reduces a storage error to something safe to log. PostgREST error bodies
 * can include `details: "Failing row contains (...)"` with the customer's
 * name, email and phone, so only the HTTP status, the Postgres error code,
 * and the message with quoted values removed are kept.
 */
export function redactLeadError(message: string): string {
  const status = /error (\d{3})/.exec(message)?.[1];
  const json = message.indexOf("{");
  let code: string | undefined;
  let detail = json === -1 ? message : message.slice(0, json);
  if (json !== -1) {
    try {
      const body = JSON.parse(message.slice(json)) as { code?: unknown; message?: unknown };
      code = typeof body.code === "string" ? body.code : undefined;
      detail = typeof body.message === "string" ? body.message : "";
    } catch {
      detail = "";
    }
  }
  const safe = detail.replace(/"[^"]*"|'[^']*'|\([^)]*\)/g, "…").replace(/\S+@\S+/g, "…").replace(/\d{7,}/g, "…").slice(0, 160).trim();
  return [status && `status ${status}`, code && `code ${code}`, safe].filter(Boolean).join(" · ");
}

/**
 * Stores a lead, then notifies the sales team.
 *
 * The lead is persisted first. A stored lead is notified through the tracked
 * delivery job (attempt history, retries with backoff, no duplicates), so a
 * Resend failure never loses the notification — it stays queued and shows in
 * the admin dashboard. If the database write fails, the sales team is emailed
 * directly so the inquiry is not lost. The submission fails only when neither
 * step succeeds.
 */
export async function submitLead(input: LeadSubmission): Promise<LeadSubmissionResult> {
  let lead: Lead | undefined;
  try {
    lead = await createLead(input);
  } catch (err) {
    // Log the failure without customer details.
    console.error(`[leads] failed to store ${input.source} lead: ${redactLeadError(err instanceof Error ? err.message : String(err))}`);
  }
  const stored = Boolean(lead);

  let notified: boolean;
  let notification: LeadSubmissionResult["notification"];
  if (lead?.tracked) {
    try {
      const outcome = await deliverLeadNotification(lead.id, "submit");
      notified = outcome.status === "sent";
    } catch (err) {
      // The lead is stored as pending; the retry job delivers it.
      console.error(`[leads] notification for lead ${lead.id} deferred to the retry job: ${redactLeadError(err instanceof Error ? err.message : String(err))}`);
      notified = false;
    }
    notification = notified ? "sent" : "queued";
  } else {
    notified = await notifyLead({ ...input, leadId: lead?.id });
    notification = notified ? "sent" : "failed";
  }

  if (!stored && !notified) {
    console.error(`[leads] ${input.source} lead was neither stored nor emailed`);
  }

  return { ok: stored || notified, leadId: lead?.id, stored, notified, notification };
}

export function leadFailureResponse() {
  return NextResponse.json(
    { message: `We couldn't send your request right now. Please call us at ${BUSINESS.phone}.` },
    { status: 500 }
  );
}

export function leadSuccessResponse(result: LeadSubmissionResult) {
  return NextResponse.json({ ok: true, ...(result.leadId ? { leadId: result.leadId } : {}) });
}
