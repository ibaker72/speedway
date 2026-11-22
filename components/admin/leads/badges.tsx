import { LEAD_STATUS_LABELS, isLeadStatus, type NotificationStatus } from "@/lib/leads/model";

const STATUS_TONE: Record<string, string> = {
  new: "bg-sky-500/15 text-sky-200 border-sky-400/30",
  contacted: "bg-violet-500/15 text-violet-200 border-violet-400/30",
  in_progress: "bg-amber-500/15 text-amber-200 border-amber-400/30",
  appointment_scheduled: "bg-teal-500/15 text-teal-200 border-teal-400/30",
  sold: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
  closed_lost: "bg-zinc-500/15 text-zinc-300 border-zinc-400/30",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_TONE[status] ?? STATUS_TONE.closed_lost}`}>
      {isLeadStatus(status) ? LEAD_STATUS_LABELS[status] : status}
    </span>
  );
}

const NOTIFICATION: Record<NotificationStatus, { label: string; tone: string }> = {
  sent: { label: "Email sent", tone: "text-emerald-300" },
  pending: { label: "Email retrying", tone: "text-amber-300" },
  sending: { label: "Email sending", tone: "text-amber-300" },
  failed: { label: "Email NOT sent", tone: "text-red-400 font-semibold" },
};

export function NotificationBadge({ status }: { status: NotificationStatus }) {
  const n = NOTIFICATION[status] ?? NOTIFICATION.failed;
  return <span className={`text-xs ${n.tone}`}>{n.label}</span>;
}

const dateFormat = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" });

export function formatLeadDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : `${dateFormat.format(date)} ET`;
}
