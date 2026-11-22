import { Resend } from "resend";
import { absoluteUrl } from "@/lib/seo/site";

export interface NotifyLeadInput {
  source: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  payload?: Record<string, unknown>;
  /** Stored lead id; adds a link to the lead in the admin dashboard. */
  leadId?: string;
}

export interface LeadEmail {
  subject: string;
  text: string;
}

/**
 * Outcome of one call to Resend. `accepted` means Resend took the email for
 * delivery; it is not proof the email reached the inbox (delivery is reported
 * later through the Resend webhook).
 */
export type SendResult =
  | { accepted: true; messageId: string | null }
  | {
      accepted: false;
      /** Resend error name (e.g. "validation_error"), or "not_configured". */
      code: string;
      /** Error text with email addresses removed; safe to store and log. */
      message: string;
      statusCode: number | null;
      /**
       * True when Resend may have accepted the email anyway (network failure,
       * 5xx): the retry must reuse the same idempotency key so it cannot
       * produce a second email.
       */
      ambiguous: boolean;
      /** Worth one immediate retry inside the same request. */
      retryNow: boolean;
    };

function formatPayload(payload: Record<string, unknown>): string {
  return Object.entries(payload)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => {
      const label = k.replace(/([A-Z])/g, " $1").replace(/[_-]/g, " ").trim();
      const capitalized = label.charAt(0).toUpperCase() + label.slice(1);
      if (typeof v === "object") return `${capitalized}: ${JSON.stringify(v)}`;
      return `${capitalized}: ${v}`;
    })
    .join("\n");
}

/** The sales-team email for a lead. Deterministic for a given lead, so retries send identical content. */
export function buildLeadEmail(input: NotifyLeadInput): LeadEmail {
  const sourceLabel = input.source.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const subjectName = input.name ? input.name.replace(/[\r\n]+/g, " ").slice(0, 100) : "";
  const subject = `New ${sourceLabel} Lead${subjectName ? ` — ${subjectName}` : ""}`;

  const lines: string[] = [`New lead from: ${sourceLabel}`, "", "--- Customer Info ---"];
  if (input.name) lines.push(`Name: ${input.name}`);
  if (input.email) lines.push(`Email: ${input.email}`);
  if (input.phone) lines.push(`Phone: ${input.phone}`);

  if (input.payload && Object.keys(input.payload).length > 0) {
    lines.push("", "--- Details ---");

    if (input.source === "deal-desk") {
      const p = input.payload;
      if (p.vehicleTitle) lines.push(`Vehicle: ${p.vehicleTitle}`);
      if (p.vehiclePrice) lines.push(`Price: $${Number(p.vehiclePrice).toLocaleString()}`);
      if (p.monthlyEstimateShown) lines.push(`Monthly Estimate: $${Number(p.monthlyEstimateShown).toLocaleString()}`);
      if (p.engagementScore) lines.push(`Engagement Score: ${p.engagementScore}`);
      if (p.engagementLabel) lines.push(`Temperature: ${p.engagementLabel}`);
      lines.push("");
    }

    if (input.source === "vehicle-inquiry") {
      const p = input.payload;
      const vehicle = (p.vehicle ?? null) as Record<string, unknown> | null;
      if (p.inquiryLabel) lines.push(`Request: ${p.inquiryLabel}`);
      if (p.vehicleOfInterest) lines.push(`Vehicle: ${p.vehicleOfInterest}`);
      if (vehicle?.stockNumber) lines.push(`Stock #: ${vehicle.stockNumber}`);
      if (vehicle?.vin) lines.push(`VIN: ${vehicle.vin}`);
      if (vehicle?.url) lines.push(`Listing: ${vehicle.url}`);
      if (vehicle?.note) lines.push(`Note: ${vehicle.note}`);
      if (p.preferredContact) lines.push(`Preferred contact: ${p.preferredContact}`);
      if (p.message) lines.push("", `Message: ${p.message}`);
      lines.push("");
    }

    if (input.source === "shipping") {
      const p = input.payload;
      const vehicle = (p.vehicle ?? null) as Record<string, unknown> | null;
      if (p.vehicleOfInterest) lines.push(`Vehicle: ${p.vehicleOfInterest}`);
      if (vehicle?.stockNumber) lines.push(`Stock #: ${vehicle.stockNumber}`);
      if (vehicle?.vin) lines.push(`VIN: ${vehicle.vin}`);
      if (vehicle?.url) lines.push(`Listing: ${vehicle.url}`);
      if (p.deliveryZip || p.deliveryState) lines.push(`Deliver to: ${[p.deliveryZip, p.deliveryState].filter(Boolean).join(", ")}`);
      if (p.message) lines.push("", `Message: ${p.message}`);
      lines.push("");
    }

    lines.push(formatPayload(input.payload));
  }

  if (input.leadId) lines.push("", `Open in the dashboard: ${absoluteUrl(`/admin/leads/${input.leadId}`)}`);

  return { subject, text: lines.join("\n") };
}

/** Removes email addresses and caps the length, so provider errors can be stored and logged. */
export function redactProviderMessage(message: string): string {
  return message.replace(/[^\s@<>"']+@[^\s@<>"']+/g, "…").replace(/\s+/g, " ").trim().slice(0, 300);
}

const AMBIGUOUS = new Set(["application_error", "internal_server_error"]);
const RETRY_NOW = new Set(["application_error", "internal_server_error", "rate_limit_exceeded", "concurrent_idempotent_requests"]);

/** The configured sender, e.g. "leads@speedwaymotorsllc.com". */
export function leadSender(): string {
  return process.env.LEAD_FROM_EMAIL || "leads@speedwaymotorsllc.com";
}

/**
 * One send attempt through Resend. Never throws. `idempotencyKey` makes
 * Resend ignore a repeat of the same request for 24 hours, so a retry after
 * an ambiguous failure cannot send the email twice.
 */
export async function sendLeadEmail(email: LeadEmail, idempotencyKey?: string): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.LEAD_NOTIFICATION_EMAIL;
  if (!apiKey || !toEmail) {
    return {
      accepted: false,
      code: "not_configured",
      message: "RESEND_API_KEY or LEAD_NOTIFICATION_EMAIL is not set",
      statusCode: null,
      ambiguous: false,
      retryNow: false,
    };
  }

  try {
    const resend = new Resend(apiKey);
    // The Resend SDK reports API failures in `error` instead of throwing.
    const { data, error } = await resend.emails.send(
      { from: leadSender(), to: toEmail, subject: email.subject, text: email.text },
      idempotencyKey ? { idempotencyKey } : undefined
    );
    if (!error) return { accepted: true, messageId: data?.id ?? null };
    const status = typeof error.statusCode === "number" ? error.statusCode : null;
    const name = String(error.name ?? "error");
    return {
      accepted: false,
      code: name,
      message: redactProviderMessage(String(error.message ?? "")),
      statusCode: status,
      ambiguous: AMBIGUOUS.has(name) || (status !== null && status >= 500),
      retryNow: RETRY_NOW.has(name) || (status !== null && (status >= 500 || status === 429)),
    };
  } catch (err) {
    return {
      accepted: false,
      code: "exception",
      message: redactProviderMessage(err instanceof Error ? err.message : String(err)),
      statusCode: null,
      ambiguous: true,
      retryNow: true,
    };
  }
}

/**
 * Untracked fallback used only when the lead could not be stored: emails the
 * sales team directly so the inquiry is not lost. Resolves true only when
 * Resend accepted the email.
 */
export async function notifyLead(input: NotifyLeadInput): Promise<boolean> {
  const result = await sendLeadEmail(buildLeadEmail(input));
  if (result.accepted) return true;
  if (result.code === "not_configured") {
    console.warn("Lead notification skipped: RESEND_API_KEY or LEAD_NOTIFICATION_EMAIL not configured");
  } else {
    console.error(`Failed to send lead notification email: ${result.code} ${result.message}`.trim());
  }
  return false;
}
