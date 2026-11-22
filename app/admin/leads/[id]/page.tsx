import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getLeadDetail } from "@/lib/leads/admin-store";
import { FINANCE_DETAIL_FIELDS, LEAD_STATUS_LABELS, isLeadStatus, leadSourceLabel } from "@/lib/leads/model";
import { AdminShell } from "@/components/admin/AdminShell";
import { LeadActions } from "@/components/admin/leads/LeadActions";
import { NotificationBadge, StatusBadge, formatLeadDate } from "@/components/admin/leads/badges";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Website Lead", robots: { index: false, follow: false } };

const card = "rounded-2xl border border-white/10 bg-surface-2 p-4";
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** Payload keys rendered in their own sections (everything else appears under "Other details"). */
const KNOWN_KEYS = new Set([
  "vehicle", "vehicleOfInterest", "inquiryType", "inquiryLabel", "message", "preferredContact", "deliveryZip", "deliveryState",
  "consentToContact", "consentText", "consentedAt", "submittedAt", "leadSource", "firstName", "lastName",
  ...FINANCE_DETAIL_FIELDS.map((f) => f.key),
]);

const text = (value: unknown) => (typeof value === "string" || typeof value === "number" ? String(value) : null);

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[8.5rem_1fr] gap-2 py-1.5 text-sm">
      <dt className="text-zinc-400">{label}</dt>
      <dd className="text-zinc-100 break-words min-w-0">{children}</dd>
    </div>
  );
}

export default async function AdminLeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await isAdminAuthenticated())) redirect(`/admin/login?next=/admin/leads/${encodeURIComponent(id)}`);

  const detail = await getLeadDetail(id);
  if (!detail) notFound();
  const { lead, vehicle, activity, attempts } = detail;
  const p = lead.payload ?? {};
  const attribution = (p.leadSource && typeof p.leadSource === "object" ? p.leadSource : {}) as Record<string, unknown>;
  const attributionRows = Object.entries(attribution).filter(([, v]) => v !== null && v !== "" && v !== undefined);
  const otherRows = Object.entries(p).filter(([k, v]) => !KNOWN_KEYS.has(k) && v !== null && v !== "" && typeof v !== "object");
  const financeRows = FINANCE_DETAIL_FIELDS.map((f) => [f.label, text(p[f.key])] as const).filter(([, v]) => v);

  return (
    <AdminShell active="leads">
      <Link href="/admin/leads" className="text-sm text-zinc-400 hover:text-white">← All leads</Link>

      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white break-words">{lead.name || "(no name given)"}</h1>
          <p className="text-sm text-zinc-400">
            {leadSourceLabel(lead.source)}
            {text(p.inquiryLabel) && ` · ${text(p.inquiryLabel)}`} · {formatLeadDate(lead.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={lead.status} />
          <NotificationBadge status={lead.notification_status} />
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4 min-w-0">
          <section aria-labelledby="h-contact" className={card}>
            <h2 id="h-contact" className="text-base font-semibold text-white mb-2">Customer</h2>
            <dl>
              <Row label="Name">{lead.name || "—"}</Row>
              <Row label="Phone">{lead.phone ? <a href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`} className="text-sky-300 hover:underline">{lead.phone}</a> : "—"}</Row>
              <Row label="Email">{lead.email ? <a href={`mailto:${lead.email}`} className="text-sky-300 hover:underline">{lead.email}</a> : "—"}</Row>
              {text(p.preferredContact) && <Row label="Prefers">{text(p.preferredContact)}</Row>}
            </dl>
          </section>

          <section aria-labelledby="h-inquiry" className={card}>
            <h2 id="h-inquiry" className="text-base font-semibold text-white mb-2">Inquiry</h2>
            <dl>
              <Row label="Type">{leadSourceLabel(lead.source)}{text(p.inquiryLabel) ? ` — ${text(p.inquiryLabel)}` : ""}</Row>
              {vehicle?.title && <Row label="Vehicle">{vehicle.url ? <a href={vehicle.url} className="text-sky-300 hover:underline" target="_blank" rel="noopener noreferrer">{vehicle.title}</a> : vehicle.title}</Row>}
              {vehicle?.stockNumber && <Row label="Stock #">{vehicle.stockNumber}</Row>}
              {vehicle?.vin && <Row label="VIN">{vehicle.vin}</Row>}
              {typeof vehicle?.price === "number" && <Row label="Listed price">{money.format(vehicle.price)}</Row>}
              {(text(p.deliveryZip) || text(p.deliveryState)) && <Row label="Ship to">{[text(p.deliveryZip), text(p.deliveryState)].filter(Boolean).join(", ")}</Row>}
              {otherRows.map(([k, v]) => (
                <Row key={k} label={k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())}>{String(v)}</Row>
              ))}
            </dl>
            {text(p.message) && <p className="mt-3 whitespace-pre-wrap rounded-lg bg-black/30 p-3 text-sm text-zinc-200">{text(p.message)}</p>}
          </section>

          {lead.source === "finance" && (
            <section aria-labelledby="h-finance" className={`${card} border-amber-400/30`}>
              <h2 id="h-finance" className="text-base font-semibold text-white">Financing details</h2>
              <p className="mb-2 text-xs text-amber-200/80">Sensitive — use only to prepare this customer&apos;s financing. Do not copy or forward.</p>
              {financeRows.length ? (
                <dl>{financeRows.map(([label, value]) => <Row key={label} label={label}>{value}</Row>)}</dl>
              ) : (
                <p className="text-sm text-zinc-400">No financing details were provided.</p>
              )}
            </section>
          )}

          <section aria-labelledby="h-consent" className={card}>
            <h2 id="h-consent" className="text-base font-semibold text-white mb-2">Consent &amp; source</h2>
            <dl>
              <Row label="Consent">
                {p.consentToContact === true
                  ? `Agreed ${formatLeadDate(text(p.consentedAt))}`
                  : "Not recorded (this form does not collect a consent checkbox)"}
              </Row>
              {text(p.consentText) && <Row label="Wording">{text(p.consentText)}</Row>}
              {attributionRows.length === 0 && <Row label="Attribution">Not recorded</Row>}
              {attributionRows.map(([k, v]) => <Row key={k} label={k}>{String(v)}</Row>)}
            </dl>
          </section>

          <section aria-labelledby="h-notify" className={card}>
            <h2 id="h-notify" className="text-base font-semibold text-white mb-2">Sales email</h2>
            <dl>
              <Row label="Status"><NotificationBadge status={lead.notification_status} /></Row>
              <Row label="Attempts">{lead.notification_attempts}</Row>
              {lead.notified_at && <Row label="Accepted">{formatLeadDate(lead.notified_at)}</Row>}
              {lead.notification_next_attempt_at && lead.notification_status !== "sent" && <Row label="Next retry">{formatLeadDate(lead.notification_next_attempt_at)}</Row>}
              {lead.notification_last_error && <Row label="Last error">{lead.notification_last_error}</Row>}
            </dl>
            {attempts.length > 0 && (
              <ol className="mt-3 space-y-1 text-xs text-zinc-400">
                {attempts.map((a) => (
                  <li key={a.id}>
                    #{a.attempt} {formatLeadDate(a.created_at)} · {a.trigger} ·{" "}
                    {a.outcome === "accepted" ? <span className="text-emerald-300">accepted{a.delivery_status ? ` → ${a.delivery_status}` : ""}</span> : <span className="text-red-300">{a.error_code}</span>}
                  </li>
                ))}
              </ol>
            )}
            <p className="mt-2 text-[11px] text-zinc-500">&quot;Accepted&quot; means Resend took the email; delivery shows once Resend reports it.</p>
          </section>
        </div>

        <aside className="space-y-4">
          <LeadActions leadId={lead.id} status={lead.status} notificationStatus={lead.notification_status} />
          <section aria-labelledby="h-activity" className={card}>
            <h2 id="h-activity" className="text-base font-semibold text-white mb-2">Activity</h2>
            {activity.length === 0 ? (
              <p className="text-sm text-zinc-400">No follow-up recorded yet.</p>
            ) : (
              <ol className="space-y-3">
                {activity.map((a) => (
                  <li key={a.id} className="text-sm">
                    <p className="text-xs text-zinc-500">{formatLeadDate(a.created_at)} · {a.actor || "Staff"}</p>
                    {a.kind === "status_change" && (
                      <p className="text-zinc-200">
                        Status: {isLeadStatus(a.from_status) ? LEAD_STATUS_LABELS[a.from_status] : a.from_status} → {isLeadStatus(a.to_status) ? LEAD_STATUS_LABELS[a.to_status] : a.to_status}
                      </p>
                    )}
                    {a.kind !== "status_change" && <p className="whitespace-pre-wrap text-zinc-200">{a.body}</p>}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </aside>
      </div>
    </AdminShell>
  );
}
