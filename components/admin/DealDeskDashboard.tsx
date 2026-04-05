"use client";

import { useMemo, useState } from "react";
import type { DealDeskLead } from "@/lib/deal-desk/types";
import { Button } from "@/components/ui/button";

interface Props { leads: DealDeskLead[] }

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function DealDeskDashboard({ leads: initialLeads }: Props) {
  const [leads, setLeads] = useState(initialLeads);
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(initialLeads[0]?.id || null);
  const [note, setNote] = useState("");

  const filtered = useMemo(() => leads.filter((lead) => {
    if (status !== "all" && lead.status !== status) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return `${lead.customer.name} ${lead.vehicle.title}`.toLowerCase().includes(q);
  }), [leads, query, status]);

  const selected = leads.find((lead) => lead.id === selectedId);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayLeads = leads.filter((lead) => lead.createdAt.slice(0, 10) === today);
    return {
      today: todayLeads.length,
      hot: leads.filter((lead) => lead.engagementLabel === "Hot").length,
      testDrive: leads.filter((lead) => lead.requestType === "test_drive").length,
      walkaround: leads.filter((lead) => lead.requestType === "walkaround").length,
      avgBudget: leads.length ? leads.reduce((sum, lead) => sum + lead.outTheDoorEstimateShown, 0) / leads.length : 0,
    };
  }, [leads]);

  async function updateLead(payload: Record<string, unknown>) {
    if (!selected) return;
    const response = await fetch(`/api/admin/deal-desk/leads/${selected.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return;
    const data = await response.json() as { lead: DealDeskLead };
    setLeads((prev) => prev.map((lead) => lead.id === data.lead.id ? data.lead : lead));
  }

  async function addNote() {
    if (!selected || !note.trim()) return;
    const response = await fetch(`/api/admin/deal-desk/leads/${selected.id}/note`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    if (!response.ok) return;
    const data = await response.json() as { lead: DealDeskLead };
    setLeads((prev) => prev.map((lead) => lead.id === data.lead.id ? data.lead : lead));
    setNote("");
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["New today", stats.today],
          ["Hot leads", stats.hot],
          ["Test drives", stats.testDrive],
          ["Walkarounds", stats.walkaround],
          ["Avg est. budget", money.format(stats.avgBudget)],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border border-white/10 bg-surface-2 p-4">
            <p className="text-xs text-zinc-500">{label}</p>
            <p className="text-2xl text-white font-semibold mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-surface-2 p-4 space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <input className="input-dark max-w-xs" placeholder="Search customer or vehicle" value={query} onChange={(e) => setQuery(e.target.value)} />
          <select className="select-dark max-w-xs" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="appointment_booked">Appointment Booked</option>
            <option value="sold">Sold</option>
            <option value="lost">Lost</option>
          </select>
        </div>
        <div className="grid lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-zinc-400 text-left border-b border-white/10">
                <tr>
                  <th className="p-2">Date/Time</th><th className="p-2">Customer</th><th className="p-2">Vehicle</th><th className="p-2">Monthly</th><th className="p-2">Score</th><th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr key={lead.id} onClick={() => setSelectedId(lead.id)} className={`border-b border-white/5 cursor-pointer ${selectedId === lead.id ? "bg-white/4" : ""}`}>
                    <td className="p-2 text-zinc-400">{new Date(lead.createdAt).toLocaleString()}</td>
                    <td className="p-2 text-white">{lead.customer.name}</td>
                    <td className="p-2 text-zinc-300">{lead.vehicle.title}</td>
                    <td className="p-2 text-zinc-300">{money.format(lead.monthlyEstimateShown)}</td>
                    <td className="p-2 text-zinc-300">{lead.engagementLabel} ({lead.engagementScore})</td>
                    <td className="p-2 text-zinc-300">{lead.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 ? <p className="text-sm text-zinc-500 p-4">No leads found for this filter.</p> : null}
          </div>

          <div className="lg:col-span-2 rounded-xl border border-white/10 bg-surface-1 p-3 space-y-3">
            {!selected ? <p className="text-sm text-zinc-500">Select a lead.</p> : (
              <>
                <p className="text-white font-semibold">{selected.customer.name}</p>
                <p className="text-sm text-zinc-400">{selected.customer.phone} • {selected.customer.email}</p>
                <p className="text-sm text-zinc-300">{selected.vehicle.title} (Stock #{selected.vehicle.stockNumber || "N/A"})</p>
                <p className="text-sm text-zinc-400">Request: {selected.requestType} • Contact via {selected.customer.preferredContactMethod}</p>
                <div className="text-xs text-zinc-400 border rounded-lg border-white/10 p-2 space-y-1">
                  <p>Term: {selected.calculatorSnapshot.termMonths} mo</p>
                  <p>Credit: {selected.calculatorSnapshot.creditTier}</p>
                  <p>Down: {money.format(selected.calculatorSnapshot.downPayment)}</p>
                  <p>Trade: {money.format(selected.calculatorSnapshot.tradeInValue)} / Payoff {money.format(selected.calculatorSnapshot.tradePayoff)}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" onClick={() => updateLead({ status: "contacted" })}>Mark Contacted</Button>
                  <Button size="sm" variant="outline" onClick={() => updateLead({ status: "appointment_booked" })}>Book Appt</Button>
                  <Button size="sm" variant="outline" onClick={() => updateLead({ status: "sold" })}>Mark Sold</Button>
                  <Button size="sm" variant="ghost" onClick={() => updateLead({ status: "lost" })}>Mark Lost</Button>
                </div>
                <input className="input-dark" placeholder="Assigned rep" defaultValue={selected.assignedRep || ""} onBlur={(e) => updateLead({ assignedRep: e.target.value })} />
                <input className="input-dark" type="number" min={1} max={3} defaultValue={selected.followUpPriority} onBlur={(e) => updateLead({ followUpPriority: Number(e.target.value) || 3 })} />
                <textarea className="input-dark resize-none" rows={2} placeholder="Add internal note" value={note} onChange={(e) => setNote(e.target.value)} />
                <Button size="sm" variant="secondary" onClick={addNote}>Add Note</Button>
                <div className="space-y-2 max-h-40 overflow-auto">
                  {selected.notes.map((item) => <div key={item.id} className="text-xs text-zinc-400 border border-white/10 rounded p-2">{item.note}</div>)}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
