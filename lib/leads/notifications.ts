import { supabaseInsert, supabaseQuery, supabaseUpdate } from "@/lib/supabase";
import { buildLeadEmail, sendLeadEmail, type SendResult } from "@/lib/leads/notify";
import type { LeadRow, NotificationStatus } from "@/lib/leads/model";

/**
 * Durable sales-team notifications for stored leads.
 *
 * The lead is stored first (status `pending`); each delivery attempt claims
 * the lead with a short lease, sends through Resend with an idempotency key,
 * records the attempt in `lead_notification_attempts`, and either marks the
 * lead `sent` or schedules the next attempt. `/api/cron/lead-notifications`
 * runs the schedule. After the last attempt the lead is `failed`: it is
 * flagged in the admin dashboard and logged as an ALERT, and only a staff
 * member can send it again.
 *
 * Duplicate protection: the claim is a conditional update on the attempt
 * counter (two workers cannot claim the same attempt), and a retry after an
 * ambiguous failure (network error, Resend 5xx — the email may have been
 * accepted) reuses that attempt's idempotency key, so Resend drops the repeat.
 */

/** Wait before the next automatic attempt, after attempt 1, 2, … (7 attempts over ~21 hours). */
export const RETRY_DELAYS_MS = [2, 10, 30, 120, 360, 720].map((minutes) => minutes * 60_000);
export const MAX_NOTIFICATION_ATTEMPTS = RETRY_DELAYS_MS.length + 1;
/** How long an in-flight attempt holds the lead before the retry job may take over. */
export const ATTEMPT_LEASE_MS = 2 * 60_000;

export type DeliveryTrigger = "submit" | "retry" | "manual";

export type DeliveryOutcome =
  | { status: "sent"; attempt: number }
  | { status: "pending"; attempt: number; code: string; nextAttemptAt: string }
  | { status: "failed"; attempt: number; code: string }
  | { status: "skipped"; reason: "already_sent" | "not_due" | "busy" | "not_found" };

interface AttemptRow {
  id: string;
  lead_id: string;
  attempt: number;
  trigger: DeliveryTrigger;
  outcome: "accepted" | "failed";
  error_code: string | null;
  error_message: string | null;
  provider_message_id: string | null;
  idempotency_key: string;
  ambiguous: boolean;
  created_at: string;
}

export interface DeliveryDeps {
  now?: () => Date;
  sleep?: (ms: number) => Promise<void>;
  send?: typeof sendLeadEmail;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function loadLead(id: string): Promise<LeadRow | null> {
  const { data, error } = await supabaseQuery<LeadRow>("leads", new URLSearchParams({ select: "*", id: `eq.${id}`, limit: "1" }));
  if (error) throw new Error(`lead lookup failed: ${error.slice(0, 120)}`);
  return data?.[0] ?? null;
}

async function lastAttempt(leadId: string): Promise<AttemptRow | null> {
  const { data, error } = await supabaseQuery<AttemptRow>(
    "lead_notification_attempts",
    new URLSearchParams({ select: "*", lead_id: `eq.${leadId}`, order: "attempt.desc", limit: "1" })
  );
  if (error) throw new Error(`attempt lookup failed: ${error.slice(0, 120)}`);
  return data?.[0] ?? null;
}

function due(lead: LeadRow, trigger: DeliveryTrigger, now: Date): boolean {
  const next = lead.notification_next_attempt_at ? new Date(lead.notification_next_attempt_at).getTime() : null;
  // Another attempt holds the lease right now: never start a second one.
  if (lead.notification_status === "sending" && next !== null && next > now.getTime()) return false;
  if (trigger === "manual") return lead.notification_status !== "sent";
  if (trigger === "submit") return lead.notification_status === "pending" && lead.notification_attempts === 0;
  if (lead.notification_status !== "pending" && lead.notification_status !== "sending") return false;
  return next === null || next <= now.getTime();
}

/**
 * Makes one tracked delivery attempt (plus one quick in-call retry for
 * transient errors). Never sends for a lead whose notification was already
 * accepted, and never sends twice for the same claimed attempt.
 */
export async function deliverLeadNotification(leadId: string, trigger: DeliveryTrigger, deps: DeliveryDeps = {}): Promise<DeliveryOutcome> {
  const now = deps.now ?? (() => new Date());
  const sleep = deps.sleep ?? defaultSleep;
  const send = deps.send ?? sendLeadEmail;

  const lead = await loadLead(leadId);
  if (!lead) return { status: "skipped", reason: "not_found" };
  if (lead.notification_status === "sent") return { status: "skipped", reason: "already_sent" };
  if (!due(lead, trigger, now())) return { status: "skipped", reason: "not_due" };

  // Claim: only succeeds if nobody else started this attempt in the meantime.
  const attempt = lead.notification_attempts + 1;
  const startedAt = now();
  const claim = await supabaseUpdate<LeadRow>(
    "leads",
    new URLSearchParams({
      id: `eq.${lead.id}`,
      notification_attempts: `eq.${lead.notification_attempts}`,
      notification_status: `eq.${lead.notification_status}`,
    }),
    {
      notification_status: "sending",
      notification_attempts: attempt,
      notification_last_attempt_at: startedAt.toISOString(),
      notification_next_attempt_at: new Date(startedAt.getTime() + ATTEMPT_LEASE_MS).toISOString(),
    },
    { idempotent: true }
  );
  if (claim.error) throw new Error(`claim failed: ${claim.error.slice(0, 120)}`);
  if (!claim.data?.length) return { status: "skipped", reason: "busy" };

  // Repeat the previous request's key whenever that request may have been accepted.
  const previous = await lastAttempt(lead.id);
  const keyFor = (n: number) => `lead-notification/${lead.id}/${n}`;
  let idempotencyKey = keyFor(attempt);
  if (lead.notification_status === "sending" && (!previous || previous.attempt < lead.notification_attempts)) {
    // The last attempt stopped before recording its outcome (e.g. the function timed out mid-send).
    const crashed = lead.notification_attempts;
    idempotencyKey =
      previous && previous.attempt === crashed - 1 && previous.outcome === "failed" && previous.ambiguous ? previous.idempotency_key : keyFor(crashed);
  } else if (previous && previous.outcome === "failed" && previous.ambiguous) {
    idempotencyKey = previous.idempotency_key;
  }

  const email = buildLeadEmail({ source: lead.source, name: lead.name, email: lead.email, phone: lead.phone, payload: lead.payload, leadId: lead.id });
  let result: SendResult = await send(email, idempotencyKey);
  if (!result.accepted && result.retryNow) {
    await sleep(400 + Math.round(Math.random() * 400));
    result = await send(email, idempotencyKey);
  }

  const finishedAt = now();
  const { error: logError } = await supabaseInsert(
    "lead_notification_attempts",
    {
      id: crypto.randomUUID(),
      lead_id: lead.id,
      attempt,
      trigger,
      outcome: result.accepted ? "accepted" : "failed",
      error_code: result.accepted ? null : result.code,
      error_message: result.accepted ? null : result.message,
      provider_message_id: result.accepted ? result.messageId : null,
      idempotency_key: idempotencyKey,
      ambiguous: result.accepted ? false : result.ambiguous,
      created_at: finishedAt.toISOString(),
    },
    { onConflict: "id", prefer: "return=minimal,resolution=ignore-duplicates", idempotent: true }
  );
  if (logError) console.error(`[leads] could not record notification attempt ${attempt} for lead ${lead.id}: ${logError.slice(0, 120)}`);

  if (result.accepted) {
    await finish(lead.id, {
      notification_status: "sent",
      notified_at: finishedAt.toISOString(),
      notification_message_id: result.messageId,
      notification_next_attempt_at: null,
      notification_last_error: null,
    });
    console.info(`[leads] notification accepted by Resend: lead=${lead.id} source=${lead.source} attempt=${attempt} trigger=${trigger}`);
    return { status: "sent", attempt };
  }

  const lastError = `${result.code}${result.statusCode ? ` (${result.statusCode})` : ""}: ${result.message}`.slice(0, 300);
  // A staff-initiated resend of a lead that had already failed does not restart automatic retries.
  const exhausted = attempt >= MAX_NOTIFICATION_ATTEMPTS || (trigger === "manual" && lead.notification_status === "failed");
  if (exhausted) {
    await finish(lead.id, { notification_status: "failed", notification_next_attempt_at: null, notification_last_error: lastError });
    console.error(
      `[leads] ALERT notification failed permanently: lead=${lead.id} source=${lead.source} attempts=${attempt} code=${result.code} — open /admin/leads to follow up`
    );
    return { status: "failed", attempt, code: result.code };
  }

  const nextAttemptAt = new Date(finishedAt.getTime() + RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length) - 1]).toISOString();
  await finish(lead.id, { notification_status: "pending", notification_next_attempt_at: nextAttemptAt, notification_last_error: lastError });
  console.warn(
    `[leads] notification attempt ${attempt}/${MAX_NOTIFICATION_ATTEMPTS} failed: lead=${lead.id} source=${lead.source} code=${result.code}${result.statusCode ? ` status=${result.statusCode}` : ""}; next attempt ${nextAttemptAt}`
  );
  return { status: "pending", attempt, code: result.code, nextAttemptAt };
}

async function finish(id: string, updates: Partial<Record<keyof LeadRow, unknown>> & { notification_status: NotificationStatus }) {
  const { error } = await supabaseUpdate("leads", new URLSearchParams({ id: `eq.${id}` }), updates, { idempotent: true });
  // The lease expires on its own, so the retry job recovers a lead left in `sending`.
  if (error) console.error(`[leads] could not update notification state for lead ${id}: ${error.slice(0, 120)}`);
}

export interface RetryRunSummary {
  due: number;
  sent: number;
  rescheduled: number;
  failed: number;
  skipped: number;
  errors: number;
}

/** Runs every due attempt (oldest first). Called by the cron job. */
export async function processDueNotifications(limit = 25, deps: DeliveryDeps = {}): Promise<RetryRunSummary> {
  const now = (deps.now ?? (() => new Date()))();
  const { data, error } = await supabaseQuery<Pick<LeadRow, "id">>(
    "leads",
    new URLSearchParams({
      select: "id",
      notification_status: "in.(pending,sending)",
      notification_next_attempt_at: `lte.${now.toISOString()}`,
      order: "notification_next_attempt_at.asc",
      limit: String(limit),
    })
  );
  if (error) throw new Error(`due notifications query failed: ${error.slice(0, 120)}`);

  const summary: RetryRunSummary = { due: data?.length ?? 0, sent: 0, rescheduled: 0, failed: 0, skipped: 0, errors: 0 };
  for (const { id } of data ?? []) {
    try {
      const outcome = await deliverLeadNotification(id, "retry", deps);
      if (outcome.status === "sent") summary.sent++;
      else if (outcome.status === "pending") summary.rescheduled++;
      else if (outcome.status === "failed") summary.failed++;
      else summary.skipped++;
    } catch (err) {
      summary.errors++;
      console.error(`[leads] retry of lead ${id} errored: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return summary;
}
