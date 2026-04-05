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

export async function notifyLead(input: NotifyLeadInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.LEAD_NOTIFICATION_EMAIL;
  const fromEmail = process.env.LEAD_FROM_EMAIL || "leads@speedwaymotorsllc.com";

  if (!apiKey || !toEmail) {
    console.warn("Lead notification skipped: RESEND_API_KEY or LEAD_NOTIFICATION_EMAIL not configured");
    return;
  }

  const resend = new Resend(apiKey);

  const sourceLabel = input.source.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const subject = `New ${sourceLabel} Lead${input.name ? ` — ${input.name}` : ""}`;

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

    lines.push(formatPayload(input.payload));
  }

  try {
    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject,
      text: lines.join("\n"),
    });
  } catch (err) {
    console.error("Failed to send lead notification email:", err);
  }
}
