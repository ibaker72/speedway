/**
 * Shared vocabulary for website leads (`public.leads`): follow-up statuses,
 * notification states, and the row shape the admin dashboard reads.
 * See db/migrations/20261122_lead_management_and_notifications.sql.
 */

export const LEAD_STATUSES = ["new", "contacted", "in_progress", "appointment_scheduled", "sold", "closed_lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  in_progress: "In Progress",
  appointment_scheduled: "Appointment Scheduled",
  sold: "Sold",
  closed_lost: "Closed / Lost",
};

export function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === "string" && (LEAD_STATUSES as readonly string[]).includes(value);
}

/**
 * pending → waiting for its first or next delivery attempt (the retry job picks
 *           it up at notification_next_attempt_at)
 * sending → an attempt holds a short lease; if the process dies mid-send the
 *           lease expires and the retry job takes over
 * sent    → Resend accepted the email (acceptance, not proof of delivery —
 *           delivery events arrive via the Resend webhook)
 * failed  → retries exhausted, or a lead from before tracking existed; no
 *           automatic retry. Staff can send it from the dashboard.
 */
export const NOTIFICATION_STATUSES = ["pending", "sending", "sent", "failed"] as const;
export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];

/** Lead sources written by the website's forms (`source` column). */
export const LEAD_SOURCE_LABELS: Record<string, string> = {
  "vehicle-inquiry": "Vehicle inquiry",
  shipping: "Shipping quote",
  finance: "Financing application",
  contact: "Contact form",
  "test-drive": "Test drive",
  "trade-in": "Trade-in",
  "sell-car": "Sell my car",
  "inventory-alert": "Inventory alert",
};

export function leadSourceLabel(source: string): string {
  return LEAD_SOURCE_LABELS[source] ?? source.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Payload keys of the financing form; shown only on the lead's detail page. */
export const FINANCE_DETAIL_FIELDS: { key: string; label: string }[] = [
  { key: "employer", label: "Employer" },
  { key: "jobTitle", label: "Job title" },
  { key: "monthlyIncome", label: "Monthly income" },
  { key: "residenceStatus", label: "Residence" },
  { key: "vehicleType", label: "Vehicle type wanted" },
  { key: "downPayment", label: "Down payment" },
  { key: "monthlyBudget", label: "Monthly budget" },
];

export interface LeadRow {
  id: string;
  source: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  payload: Record<string, unknown>;
  status: string;
  created_at: string;
  notified_at: string | null;
  notification_status: NotificationStatus;
  notification_attempts: number;
  notification_next_attempt_at: string | null;
  notification_last_attempt_at: string | null;
  notification_last_error: string | null;
  notification_message_id: string | null;
  status_updated_at: string | null;
  updated_at: string | null;
}

export interface LeadVehicleSummary {
  id?: string;
  title?: string | null;
  vin?: string | null;
  stockNumber?: string | null;
  price?: number | null;
  url?: string;
  slug?: string;
}

/** The vehicle a lead is about, from the server-resolved `payload.vehicle`. */
export function leadVehicle(payload: Record<string, unknown> | null | undefined): LeadVehicleSummary | null {
  const vehicle = payload?.vehicle;
  if (vehicle && typeof vehicle === "object") return vehicle as LeadVehicleSummary;
  const title = typeof payload?.vehicleOfInterest === "string" ? payload.vehicleOfInterest : null;
  return title ? { title } : null;
}
