import { supabaseInsert, supabaseQuery, supabaseUpdate } from "@/lib/supabase";
import { deliverLeadNotification, type DeliveryOutcome } from "@/lib/leads/notifications";
import {
  LEAD_STATUSES,
  isLeadStatus,
  leadVehicle,
  type LeadRow,
  type LeadStatus,
  type LeadVehicleSummary,
  type NotificationStatus,
} from "@/lib/leads/model";

/**
 * Server-only reads and writes behind /admin/leads. Callers must already have
 * checked isAdminAuthenticated(). Uses the service-role key (never sent to the
 * browser); `public.leads` has RLS with no policies, so nothing else can read it.
 */

export const LIST_LIMIT = 500;

export interface LeadListFilters {
  /** A status, or "open" for New + In Progress (the dealership owes the next step). */
  status?: LeadStatus | "open";
  source?: string;
  /** YYYY-MM-DD, inclusive, UTC */
  from?: string;
  to?: string;
  notification?: "failed" | "pending";
  vehicle?: string;
  q?: string;
}

/** List rows carry contact and vehicle details only — never financing fields. */
export interface LeadListItem {
  id: string;
  source: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  created_at: string;
  notification_status: NotificationStatus;
  notification_attempts: number;
  notification_last_error: string | null;
  vehicle: LeadVehicleSummary | null;
  inquiryLabel: string | null;
  utmSource: string | null;
}

interface LeadListRow extends Omit<LeadListItem, "vehicle" | "utmSource"> {
  vehicle: LeadVehicleSummary | null;
  vehicleOfInterest: string | null;
  leadSource: { utmSource?: string | null } | null;
}

const LIST_SELECT = [
  "id",
  "source",
  "name",
  "email",
  "phone",
  "status",
  "created_at",
  "notification_status",
  "notification_attempts",
  "notification_last_error",
  "vehicle:payload->vehicle",
  "vehicleOfInterest:payload->>vehicleOfInterest",
  "inquiryLabel:payload->>inquiryLabel",
  "leadSource:payload->leadSource",
].join(",");

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const SOURCE = /^[a-z][a-z0-9-]{0,40}$/;

export function parseLeadFilters(params: Record<string, string | string[] | undefined>): LeadListFilters {
  const one = (key: string) => {
    const value = params[key];
    return (Array.isArray(value) ? value[0] : value)?.trim() || undefined;
  };
  const status = one("status");
  const source = one("source");
  const from = one("from");
  const to = one("to");
  const notification = one("notification");
  return {
    status: isLeadStatus(status) || status === "open" ? status : undefined,
    source: source && SOURCE.test(source) ? source : undefined,
    from: from && DATE.test(from) ? from : undefined,
    to: to && DATE.test(to) ? to : undefined,
    notification: notification === "failed" || notification === "pending" ? notification : undefined,
    vehicle: one("vehicle")?.slice(0, 80),
    q: one("q")?.slice(0, 80),
  };
}

const digits = (value: string | null | undefined) => (value ?? "").replace(/\D/g, "");

/** Name, email, phone (any formatting), VIN or stock number. */
export function matchesSearch(item: Pick<LeadListItem, "name" | "email" | "phone" | "vehicle">, q: string): boolean {
  const needle = q.toLowerCase();
  const haystack = [item.name, item.email, item.vehicle?.vin, item.vehicle?.stockNumber, item.vehicle?.title]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (haystack.includes(needle)) return true;
  const qDigits = digits(q);
  return qDigits.length >= 4 && digits(item.phone).includes(qDigits);
}

function matchesVehicle(item: Pick<LeadListItem, "vehicle">, vehicle: string): boolean {
  const needle = vehicle.toLowerCase();
  return [item.vehicle?.title, item.vehicle?.vin, item.vehicle?.stockNumber].some((v) => v?.toLowerCase().includes(needle));
}

export async function listLeads(filters: LeadListFilters): Promise<{ leads: LeadListItem[]; truncated: boolean }> {
  const params = new URLSearchParams({ select: LIST_SELECT, order: "created_at.desc", limit: String(LIST_LIMIT + 1) });
  if (filters.status === "open") params.set("status", "in.(new,in_progress)");
  else if (filters.status) params.set("status", `eq.${filters.status}`);
  if (filters.source) params.set("source", `eq.${filters.source}`);
  if (filters.from) params.append("created_at", `gte.${filters.from}T00:00:00Z`);
  if (filters.to) params.append("created_at", `lte.${filters.to}T23:59:59.999Z`);
  if (filters.notification === "failed") params.set("notification_status", "eq.failed");
  if (filters.notification === "pending") params.set("notification_status", "in.(pending,sending)");

  const { data, error } = await supabaseQuery<LeadListRow>("leads", params);
  if (error) throw new Error(`Could not load leads (${error.slice(0, 80)})`);
  const rows = data ?? [];
  const truncated = rows.length > LIST_LIMIT;
  const leads = rows.slice(0, LIST_LIMIT).map(
    ({ vehicleOfInterest, leadSource, vehicle, ...row }): LeadListItem => ({
      ...row,
      vehicle: vehicle ?? (vehicleOfInterest ? { title: vehicleOfInterest } : null),
      utmSource: leadSource?.utmSource ?? null,
    })
  );
  return {
    leads: leads.filter((lead) => (!filters.q || matchesSearch(lead, filters.q)) && (!filters.vehicle || matchesVehicle(lead, filters.vehicle))),
    truncated,
  };
}

export interface LeadSummary {
  total: number;
  byStatus: Record<LeadStatus, number>;
  /** New or In Progress: the dealership owes the next step. */
  awaitingFollowUp: number;
  failedNotifications: number;
  pendingNotifications: number;
}

export async function leadSummary(): Promise<LeadSummary> {
  const { data, error } = await supabaseQuery<{ status: string; notification_status: string }>(
    "leads",
    new URLSearchParams({ select: "status,notification_status", limit: "10000" })
  );
  if (error) throw new Error(`Could not load lead summary (${error.slice(0, 80)})`);
  const byStatus = Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0])) as Record<LeadStatus, number>;
  let failed = 0;
  let pending = 0;
  for (const row of data ?? []) {
    if (isLeadStatus(row.status)) byStatus[row.status]++;
    if (row.notification_status === "failed") failed++;
    if (row.notification_status === "pending" || row.notification_status === "sending") pending++;
  }
  return {
    total: data?.length ?? 0,
    byStatus,
    awaitingFollowUp: byStatus.new + byStatus.in_progress,
    failedNotifications: failed,
    pendingNotifications: pending,
  };
}

export interface LeadActivity {
  id: string;
  kind: "status_change" | "note" | "notification_requested";
  from_status: string | null;
  to_status: string | null;
  body: string | null;
  actor: string | null;
  created_at: string;
}

export interface NotificationAttempt {
  id: string;
  attempt: number;
  trigger: string;
  outcome: "accepted" | "failed";
  error_code: string | null;
  error_message: string | null;
  provider_message_id: string | null;
  delivery_status: string | null;
  delivery_updated_at: string | null;
  created_at: string;
}

export interface LeadDetail {
  lead: LeadRow;
  vehicle: LeadVehicleSummary | null;
  activity: LeadActivity[];
  attempts: NotificationAttempt[];
}

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getLeadDetail(id: string): Promise<LeadDetail | null> {
  if (!UUID.test(id)) return null;
  const [lead, activity, attempts] = await Promise.all([
    supabaseQuery<LeadRow>("leads", new URLSearchParams({ select: "*", id: `eq.${id}`, limit: "1" })),
    supabaseQuery<LeadActivity>("lead_activity", new URLSearchParams({ select: "*", lead_id: `eq.${id}`, order: "created_at.desc", limit: "200" })),
    supabaseQuery<NotificationAttempt>(
      "lead_notification_attempts",
      new URLSearchParams({
        select: "id,attempt,trigger,outcome,error_code,error_message,provider_message_id,delivery_status,delivery_updated_at,created_at",
        lead_id: `eq.${id}`,
        order: "attempt.desc",
        limit: "50",
      })
    ),
  ]);
  const error = lead.error ?? activity.error ?? attempts.error;
  if (error) throw new Error(`Could not load lead (${error.slice(0, 80)})`);
  const row = lead.data?.[0];
  if (!row) return null;
  return { lead: row, vehicle: leadVehicle(row.payload), activity: activity.data ?? [], attempts: attempts.data ?? [] };
}

/** Staff name typed in the dashboard (there are no per-user accounts yet). */
export function cleanActor(value: unknown): string {
  const actor = typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim().slice(0, 60) : "";
  return actor || "Staff";
}

export function cleanNote(value: unknown): string {
  return typeof value === "string" ? value.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "").trim().slice(0, 2000) : "";
}

async function recordActivity(entry: Omit<LeadActivity, "id" | "created_at"> & { lead_id: string }) {
  const { error } = await supabaseInsert(
    "lead_activity",
    { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...entry },
    { onConflict: "id", prefer: "return=minimal,resolution=ignore-duplicates", idempotent: true }
  );
  if (error) throw new Error(`Could not record activity (${error.slice(0, 80)})`);
}

export type MutationResult = { ok: true } | { ok: false; status: 400 | 404 | 409 | 500; message: string };

export async function updateLeadStatus(id: string, status: unknown, actor: string): Promise<MutationResult> {
  if (!UUID.test(id)) return { ok: false, status: 404, message: "Lead not found" };
  if (!isLeadStatus(status)) return { ok: false, status: 400, message: "Unknown status" };
  const current = await supabaseQuery<Pick<LeadRow, "id" | "status">>("leads", new URLSearchParams({ select: "id,status", id: `eq.${id}`, limit: "1" }));
  if (current.error) return { ok: false, status: 500, message: "Could not load lead" };
  const lead = current.data?.[0];
  if (!lead) return { ok: false, status: 404, message: "Lead not found" };
  if (lead.status === status) return { ok: true };

  const now = new Date().toISOString();
  // Conditional on the status we read, so two staff members cannot silently overwrite each other.
  const updated = await supabaseUpdate<LeadRow>(
    "leads",
    new URLSearchParams({ id: `eq.${id}`, status: `eq.${lead.status}` }),
    { status, status_updated_at: now, updated_at: now }
  );
  if (updated.error) return { ok: false, status: 500, message: "Could not update lead" };
  if (!updated.data?.length) return { ok: false, status: 409, message: "Someone else just changed this lead. Reload and try again." };
  await recordActivity({ lead_id: id, kind: "status_change", from_status: lead.status, to_status: status, body: null, actor });
  return { ok: true };
}

export async function addLeadNote(id: string, note: string, actor: string): Promise<MutationResult> {
  if (!UUID.test(id)) return { ok: false, status: 404, message: "Lead not found" };
  if (!note) return { ok: false, status: 400, message: "Write a note first" };
  const lead = await supabaseQuery<Pick<LeadRow, "id">>("leads", new URLSearchParams({ select: "id", id: `eq.${id}`, limit: "1" }));
  if (lead.error) return { ok: false, status: 500, message: "Could not load lead" };
  if (!lead.data?.length) return { ok: false, status: 404, message: "Lead not found" };
  await recordActivity({ lead_id: id, kind: "note", from_status: null, to_status: null, body: note, actor });
  await supabaseUpdate("leads", new URLSearchParams({ id: `eq.${id}` }), { updated_at: new Date().toISOString() }, { idempotent: true });
  return { ok: true };
}

/** Staff-initiated send (e.g. a lead from before email worked). Recorded in the activity log. */
export async function sendLeadNotificationNow(id: string, actor: string): Promise<MutationResult & { outcome?: DeliveryOutcome }> {
  if (!UUID.test(id)) return { ok: false, status: 404, message: "Lead not found" };
  const outcome = await deliverLeadNotification(id, "manual");
  if (outcome.status === "skipped") {
    if (outcome.reason === "not_found") return { ok: false, status: 404, message: "Lead not found" };
    if (outcome.reason === "already_sent") return { ok: false, status: 409, message: "The notification for this lead was already sent." };
    return { ok: false, status: 409, message: "A send is already in progress for this lead. Try again in a couple of minutes." };
  }
  await recordActivity({
    lead_id: id,
    kind: "notification_requested",
    from_status: null,
    to_status: null,
    body: outcome.status === "sent" ? "Sales notification sent (accepted by Resend)" : `Sales notification failed: ${"code" in outcome ? outcome.code : "error"}`,
    actor,
  });
  return { ok: true, outcome };
}
