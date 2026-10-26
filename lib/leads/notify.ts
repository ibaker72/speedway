import { Resend } from "resend";

interface NotifyLeadInput {
  source: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  payload?: Record<string, unknown>;
}

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

/** Emails the sales team about a new lead. Resolves true only when the email was accepted. */
export async function notifyLead(input: NotifyLeadInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.LEAD_NOTIFICATION_EMAIL;
  const fromEmail = process.env.LEAD_FROM_EMAIL || "leads@speedwaymotorsllc.com";

  if (!apiKey || !toEmail) {
    console.warn("Lead notification skipped: RESEND_API_KEY or LEAD_NOTIFICATION_EMAIL not configured");
    return false;
  }

  const resend = new Resend(apiKey);

  const sourceLabel = input.source.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const subjectName = input.name ? input.name.replace(/[\r\n]+/g, " ").slice(0, 100) : "";
  const subject = `New ${sourceLabel} Lead${subjectName ? ` — ${subjectName}` : ""}`;

  const lines: string[] = [
    `New lead from: ${sourceLabel}`,
    "",
    "--- Customer Info ---",
  ];
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

    if (input.source === "shipping") {
      const p = input.payload;
      const vehicle = (p.vehicle ?? null) as Record<string, unknown> | null;
      if (p.vehicleOfInterest) lines.push(`Vehicle: ${p.vehicleOfInterest}`);
      if (vehicle?.stockNumber) lines.push(`Stock #: ${vehicle.stockNumber}`);
      if (vehicle?.url) lines.push(`Listing: ${vehicle.url}`);
      if (p.deliveryZip || p.deliveryState) lines.push(`Deliver to: ${[p.deliveryZip, p.deliveryState].filter(Boolean).join(", ")}`);
      if (p.message) lines.push("", `Message: ${p.message}`);
      lines.push("");
    }

    lines.push(formatPayload(input.payload));
  }

  try {
    // The Resend SDK reports API failures in `error` instead of throwing.
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject,
      text: lines.join("\n"),
    });
    if (error) {
      console.error(`Failed to send lead notification email: ${error.name ?? "error"} ${error.message ?? ""}`.trim());
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to send lead notification email:", err instanceof Error ? err.message : String(err));
    return false;
  }
}
