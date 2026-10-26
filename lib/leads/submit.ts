import { NextResponse } from "next/server";
import { createLead } from "@/lib/leads/store";
import { notifyLead } from "@/lib/leads/notify";
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
  notified: boolean;
}

/**
 * Stores a lead and emails the sales team. The two steps are independent: if
 * the database write fails (for example, the `leads` table is missing), the
 * email notification is still sent so the customer's inquiry is not lost.
 * The submission only fails when neither step succeeds.
 */
export async function submitLead(input: LeadSubmission): Promise<LeadSubmissionResult> {
  let leadId: string | undefined;
  let stored = false;
  try {
    const lead = await createLead(input);
    leadId = lead?.id;
    stored = true;
  } catch (err) {
    // Log the failure without customer details.
    console.error(`[leads] failed to store ${input.source} lead: ${err instanceof Error ? err.message : String(err)}`);
  }

  const notified = await notifyLead(input);
  if (!stored && !notified) {
    console.error(`[leads] ${input.source} lead was neither stored nor emailed`);
  }

  return { ok: stored || notified, leadId, stored, notified };
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
