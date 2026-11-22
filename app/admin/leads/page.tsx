import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { LIST_LIMIT, leadSummary, listLeads, parseLeadFilters, type LeadListFilters } from "@/lib/leads/admin-store";
import { LEAD_SOURCE_LABELS, LEAD_STATUSES, LEAD_STATUS_LABELS, leadSourceLabel } from "@/lib/leads/model";
import { AdminShell } from "@/components/admin/AdminShell";
import { NotificationBadge, StatusBadge, formatLeadDate } from "@/components/admin/leads/badges";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Website Leads", robots: { index: false, follow: false } };

const field = "w-full rounded-lg border border-white/10 bg-surface-1 px-3 py-2 text-sm text-white";

function filterHref(filters: LeadListFilters): string {
  const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][]);
  const qs = params.toString();
  return qs ? `/admin/leads?${qs}` : "/admin/leads";
}

export default async function AdminLeadsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login?next=/admin/leads");
  const filters = parseLeadFilters(await searchParams);

  let data: { list: Awaited<ReturnType<typeof listLeads>>; summary: Awaited<ReturnType<typeof leadSummary>> } | null = null;
  try {
    const [list, summary] = await Promise.all([listLeads(filters), leadSummary()]);
    data = { list, summary };
  } catch (err) {
    console.error(`[admin/leads] ${err instanceof Error ? err.message : String(err)}`);
  }

  const cards = data
    ? [
        { label: "New", value: data.summary.byStatus.new, href: filterHref({ status: "new" }) },
        { label: "Awaiting follow-up", value: data.summary.awaitingFollowUp, href: filterHref({ status: "open" }), hint: "New + In Progress" },
        { label: "Contacted", value: data.summary.byStatus.contacted, href: filterHref({ status: "contacted" }) },
        { label: "Appointments", value: data.summary.byStatus.appointment_scheduled, href: filterHref({ status: "appointment_scheduled" }) },
        { label: "Sold", value: data.summary.byStatus.sold, href: filterHref({ status: "sold" }) },
        { label: "Failed notifications", value: data.summary.failedNotifications, href: filterHref({ notification: "failed" }), alert: data.summary.failedNotifications > 0 },
      ]
    : [];

  return (
    <AdminShell active="leads">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Website Leads</h1>
        <p className="text-sm text-zinc-400">Every inquiry from the website&apos;s forms. Customer details are confidential — do not forward them outside the dealership.</p>
      </div>

      {!data && (
        <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          Leads could not be loaded right now. Reload in a moment; nothing has been lost.
        </p>
      )}

      {data && data.summary.failedNotifications > 0 && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" aria-hidden="true" />
          <p>
            {data.summary.failedNotifications} lead{data.summary.failedNotifications === 1 ? "'s" : "s'"} sales email was not delivered. These customers may not have heard
            back. <Link href={filterHref({ notification: "failed" })} className="font-semibold underline">Show them</Link>
          </p>
        </div>
      )}

      {data && (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {cards.map((card) => (
            <li key={card.label}>
              <Link
                href={card.href}
                className={`block rounded-xl border p-3 hover:bg-white/5 ${card.alert ? "border-red-500/40 bg-red-500/10" : "border-white/10 bg-surface-2"}`}
              >
                <span className="block text-xs text-zinc-400">{card.label}</span>
                <span className={`block text-2xl font-bold ${card.alert ? "text-red-300" : "text-white"}`}>{card.value}</span>
                {card.hint && <span className="block text-[11px] text-zinc-500">{card.hint}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <form method="get" action="/admin/leads" className="grid grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-surface-2 p-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Filter leads">
        <div className="sm:col-span-2">
          <label htmlFor="f-q" className="block text-xs text-zinc-400 mb-1">Search name, email, phone, VIN or stock #</label>
          <input id="f-q" name="q" defaultValue={filters.q} className={field} type="search" />
        </div>
        <div>
          <label htmlFor="f-status" className="block text-xs text-zinc-400 mb-1">Status</label>
          <select id="f-status" name="status" defaultValue={filters.status ?? ""} className={field}>
            <option value="">All statuses</option>
            <option value="open">Awaiting follow-up (New + In Progress)</option>
            {LEAD_STATUSES.map((s) => <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="f-source" className="block text-xs text-zinc-400 mb-1">Inquiry type</label>
          <select id="f-source" name="source" defaultValue={filters.source ?? ""} className={field}>
            <option value="">All types</option>
            {Object.entries(LEAD_SOURCE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="f-vehicle" className="block text-xs text-zinc-400 mb-1">Vehicle</label>
          <input id="f-vehicle" name="vehicle" defaultValue={filters.vehicle} className={field} placeholder="e.g. Wrangler" />
        </div>
        <div>
          <label htmlFor="f-notification" className="block text-xs text-zinc-400 mb-1">Sales email</label>
          <select id="f-notification" name="notification" defaultValue={filters.notification ?? ""} className={field}>
            <option value="">Any</option>
            <option value="failed">Not delivered</option>
            <option value="pending">Still retrying</option>
          </select>
        </div>
        <div>
          <label htmlFor="f-from" className="block text-xs text-zinc-400 mb-1">From</label>
          <input id="f-from" name="from" type="date" defaultValue={filters.from} className={field} />
        </div>
        <div>
          <label htmlFor="f-to" className="block text-xs text-zinc-400 mb-1">To</label>
          <input id="f-to" name="to" type="date" defaultValue={filters.to} className={field} />
        </div>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
          <button type="submit" className="rounded-lg bg-[#D31119] px-4 py-2 text-sm font-semibold text-white">Apply filters</button>
          <Link href="/admin/leads" className="rounded-lg px-4 py-2 text-sm text-zinc-300 hover:bg-white/5">Reset</Link>
        </div>
      </form>

      {data && (
        <section aria-labelledby="lead-list-heading" className="space-y-2">
          <h2 id="lead-list-heading" className="text-sm text-zinc-400">
            {data.list.leads.length} lead{data.list.leads.length === 1 ? "" : "s"}
            {data.list.truncated && ` (newest ${LIST_LIMIT} searched — narrow the dates to see older ones)`}
          </h2>
          {data.list.leads.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-surface-2 p-6 text-center text-sm text-zinc-400">No leads match these filters.</p>
          ) : (
            <ul className="space-y-2">
              {data.list.leads.map((lead) => (
                <li key={lead.id} className="rounded-xl border border-white/10 bg-surface-2 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 space-y-1">
                      <Link href={`/admin/leads/${lead.id}`} className="text-base font-semibold text-white hover:underline">
                        {lead.name || "(no name given)"}
                      </Link>
                      <p className="text-sm text-zinc-300">
                        {leadSourceLabel(lead.source)}
                        {lead.inquiryLabel && ` · ${lead.inquiryLabel}`}
                      </p>
                      {lead.vehicle?.title && (
                        <p className="text-sm text-zinc-400 break-words">
                          {lead.vehicle.title}
                          {lead.vehicle.stockNumber && ` · Stock ${lead.vehicle.stockNumber}`}
                          {lead.vehicle.vin && ` · VIN ${lead.vehicle.vin}`}
                        </p>
                      )}
                      <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        {lead.phone && <a href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`} className="text-sky-300 hover:underline">{lead.phone}</a>}
                        {lead.email && <a href={`mailto:${lead.email}`} className="text-sky-300 hover:underline break-all">{lead.email}</a>}
                      </p>
                    </div>
                    <div className="flex flex-row flex-wrap items-center gap-3 md:flex-col md:items-end md:gap-1 md:text-right shrink-0">
                      <StatusBadge status={lead.status} />
                      <NotificationBadge status={lead.notification_status} />
                      <span className="text-xs text-zinc-500">{formatLeadDate(lead.created_at)}</span>
                      {lead.utmSource && <span className="text-xs text-zinc-500">via {lead.utmSource}</span>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </AdminShell>
  );
}
