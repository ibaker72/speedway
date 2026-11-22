"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LEAD_STATUSES, LEAD_STATUS_LABELS, type LeadStatus, type NotificationStatus } from "@/lib/leads/model";
import { useStaffName } from "@/components/admin/leads/staff-name";

async function send(url: string, method: "PATCH" | "POST", body: Record<string, unknown>): Promise<{ ok: boolean; message?: string; data?: Record<string, unknown> }> {
  try {
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (res.status === 401) return { ok: false, message: "Your session expired. Sign in again." };
    return res.ok ? { ok: true, data } : { ok: false, message: typeof data.message === "string" ? data.message : "Something went wrong." };
  } catch {
    return { ok: false, message: "Network error — please try again." };
  }
}

const field = "w-full rounded-lg border border-white/10 bg-surface-1 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none";

/** Status, notes, and the manual "send notification" action for one lead. */
export function LeadActions({ leadId, status, notificationStatus }: { leadId: string; status: string; notificationStatus: NotificationStatus }) {
  const router = useRouter();
  const [actor, setActor] = useStaffName();
  const [nextStatus, setNextStatus] = useState(status);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<null | "status" | "note" | "notify">(null);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  async function run(kind: "status" | "note" | "notify", action: () => Promise<{ ok: boolean; message?: string; data?: Record<string, unknown> }>, success: (data?: Record<string, unknown>) => string) {
    setBusy(kind);
    setMessage(null);
    const result = await action();
    setBusy(null);
    if (!result.ok) return setMessage({ tone: "error", text: result.message ?? "Something went wrong." });
    setMessage({ tone: "ok", text: success(result.data) });
    router.refresh();
  }

  return (
    <section aria-labelledby="lead-actions" className="rounded-2xl border border-white/10 bg-surface-2 p-4 space-y-4">
      <h2 id="lead-actions" className="text-base font-semibold text-white">
        Follow-up
      </h2>
      <div>
        <label htmlFor="staff-name" className="block text-xs font-medium text-zinc-400 mb-1">
          Your name (recorded with changes)
        </label>
        <input id="staff-name" value={actor} onChange={(e) => setActor(e.target.value)} maxLength={60} className={field} autoComplete="name" />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="lead-status" className="block text-xs font-medium text-zinc-400 mb-1">
            Lead status
          </label>
          <select id="lead-status" value={nextStatus} onChange={(e) => setNextStatus(e.target.value)} className={field}>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {LEAD_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          disabled={busy !== null || nextStatus === status}
          onClick={() =>
            run("status", () => send(`/api/admin/leads/${leadId}`, "PATCH", { status: nextStatus, actor }), () => `Status changed to ${LEAD_STATUS_LABELS[nextStatus as LeadStatus]}.`)
          }
          className="rounded-lg bg-[#D31119] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          {busy === "status" ? "Saving…" : "Save status"}
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!note.trim()) return;
          void run("note", () => send(`/api/admin/leads/${leadId}/notes`, "POST", { note, actor }), () => {
            setNote("");
            return "Note saved.";
          });
        }}
        className="space-y-2"
      >
        <label htmlFor="lead-note" className="block text-xs font-medium text-zinc-400">
          Add a note
        </label>
        <textarea id="lead-note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={2000} className={field} placeholder="Called, left voicemail…" />
        <button type="submit" disabled={busy !== null || !note.trim()} className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">
          {busy === "note" ? "Saving…" : "Save note"}
        </button>
      </form>

      {notificationStatus !== "sent" && (
        <div className="border-t border-white/10 pt-4">
          <p className="text-xs text-zinc-400 mb-2">
            The sales email for this lead has not been delivered. Sending it now emails the sales inbox only — never the customer.
          </p>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => {
              if (!window.confirm("Send the sales notification email for this lead now?")) return;
              void run("notify", () => send(`/api/admin/leads/${leadId}/notify`, "POST", { actor }), (data) =>
                data?.notification === "sent" ? "Sent — Resend accepted the email." : "Not sent — see the notification history below."
              );
            }}
            className="rounded-lg border border-amber-400/40 px-4 py-2 text-sm font-semibold text-amber-200 disabled:opacity-40"
          >
            {busy === "notify" ? "Sending…" : "Send sales notification"}
          </button>
        </div>
      )}

      {message && (
        <p role="status" className={`text-sm ${message.tone === "ok" ? "text-emerald-300" : "text-red-400"}`}>
          {message.text}
        </p>
      )}
    </section>
  );
}
