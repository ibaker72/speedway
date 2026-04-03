"use client";

import { useEffect, useMemo, useState } from "react";
import { DEAL_DESK_CONFIG, type CreditTier } from "@/lib/deal-desk-config";
import { calculateDealEstimate } from "@/lib/deal-desk/calculate";
import { Button } from "@/components/ui/button";
import { DealDeskLeadModal } from "@/components/shared/DealDeskLeadModal";
import { VehicleImage } from "@/components/shared/VehicleImage";
import type { DealDeskRequestType, DealSnapshot } from "@/lib/deal-desk/types";

interface BuildMyDealModuleProps {
  vehicle: {
    id: string;
    slug: string;
    stockNumber?: string;
    title: string;
    price: number;
    mileage: number;
    imageUrl?: string;
  };
}

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function getSessionId() {
  if (typeof window === "undefined") return "server";
  const key = "speedway-deal-desk-session";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const created = `s_${crypto.randomUUID()}`;
  window.localStorage.setItem(key, created);
  return created;
}

function getInitialState(vehicleId: string, price: number) {
  if (typeof window === "undefined") {
    return { downPayment: Math.min(3000, price * 0.15), termMonths: DEAL_DESK_CONFIG.defaultTerm, creditTier: "good" as CreditTier, tradeInValue: 0, tradePayoff: 0 };
  }
  const fallback = { downPayment: Math.min(3000, price * 0.15), termMonths: DEAL_DESK_CONFIG.defaultTerm, creditTier: "good" as CreditTier, tradeInValue: 0, tradePayoff: 0 };
  const cached = window.localStorage.getItem(`deal-builder-${vehicleId}`);
  if (!cached) return fallback;
  try {
    const parsed = JSON.parse(cached) as Partial<DealSnapshot>;
    return {
      downPayment: typeof parsed.downPayment === "number" ? parsed.downPayment : fallback.downPayment,
      termMonths: typeof parsed.termMonths === "number" ? parsed.termMonths : fallback.termMonths,
      creditTier: parsed.creditTier || fallback.creditTier,
      tradeInValue: typeof parsed.tradeInValue === "number" ? parsed.tradeInValue : fallback.tradeInValue,
      tradePayoff: typeof parsed.tradePayoff === "number" ? parsed.tradePayoff : fallback.tradePayoff,
    };
  } catch {
    return fallback;
  }
}

export function BuildMyDealModule({ vehicle }: BuildMyDealModuleProps) {
  const storageKey = `deal-builder-${vehicle.id}`;
  const [form, setForm] = useState(() => getInitialState(vehicle.id, vehicle.price));
  const [openRequestType, setOpenRequestType] = useState<DealDeskRequestType | null>(null);

  const result = useMemo(() => calculateDealEstimate({
    vehiclePrice: vehicle.price,
    downPayment: form.downPayment,
    tradeInValue: form.tradeInValue,
    tradePayoff: form.tradePayoff,
    termMonths: form.termMonths,
    apr: DEAL_DESK_CONFIG.aprByCreditTier[form.creditTier],
    taxRate: DEAL_DESK_CONFIG.taxAssumptions.taxRate,
    docFee: DEAL_DESK_CONFIG.feeAssumptions.docFee,
    titleAndRegistrationFee: DEAL_DESK_CONFIG.feeAssumptions.titleAndRegistrationFee,
    taxableIncludesFees: DEAL_DESK_CONFIG.taxAssumptions.taxableIncludesFees,
    tradeReducesTaxableBase: DEAL_DESK_CONFIG.taxAssumptions.tradeReducesTaxableBase,
  }), [form, vehicle.price]);

  const snapshot = useMemo((): DealSnapshot => ({ ...form, result }), [form, result]);

  useEffect(() => {
    void fetch("/api/deal-desk/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "deal_builder_opened",
        vehicleId: vehicle.id,
        vehicleSlug: vehicle.slug,
        sessionId: getSessionId(),
      }),
    });
  }, [vehicle.id, vehicle.slug]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(snapshot));
    void fetch("/api/deal-desk/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "deal_value_changed",
        vehicleId: vehicle.id,
        vehicleSlug: vehicle.slug,
        sessionId: getSessionId(),
        metadata: { downPayment: form.downPayment, termMonths: form.termMonths, creditTier: form.creditTier },
      }),
    });
  }, [storageKey, snapshot, vehicle.id, vehicle.slug, form]);

  useEffect(() => {
    if (form.tradeInValue <= 0) return;
    void fetch("/api/deal-desk/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "trade_in_used",
        vehicleId: vehicle.id,
        vehicleSlug: vehicle.slug,
        sessionId: getSessionId(),
        metadata: { tradeInValue: form.tradeInValue, tradePayoff: form.tradePayoff },
      }),
    });
  }, [form.tradeInValue, form.tradePayoff, vehicle.id, vehicle.slug]);

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-surface-2 p-4 md:p-6 space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Build My Deal</h3>
          <div className="rounded-xl border border-white/[0.08] bg-surface-1 p-3 flex gap-3 items-center">
            <div className="relative h-16 w-24 rounded-md bg-white/[0.05] overflow-hidden">
              {vehicle.imageUrl ? <VehicleImage src={vehicle.imageUrl} alt={vehicle.title} make="Vehicle" model="Image" className="h-full w-full object-cover" /> : null}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{vehicle.title}</p>
              <p className="text-xs text-zinc-400">Stock #{vehicle.stockNumber || "N/A"} • {vehicle.mileage.toLocaleString()} mi</p>
              <p className="text-sm text-accent-light font-semibold">{money.format(vehicle.price)}</p>
            </div>
          </div>
          <label className="block text-sm text-zinc-300">Down Payment</label>
          <input type="range" min={0} max={Math.max(vehicle.price, 1000)} step={250} value={form.downPayment}
            onChange={(e) => setForm((prev) => ({ ...prev, downPayment: Number(e.target.value) }))} className="w-full" />
          <input className="input-dark" value={Math.round(form.downPayment)} onChange={(e) => setForm((prev) => ({ ...prev, downPayment: Number(e.target.value) || 0 }))} />

          <div>
            <p className="text-sm text-zinc-300 mb-2">Term Length</p>
            <div className="grid grid-cols-5 gap-2">
              {DEAL_DESK_CONFIG.termOptions.map((term) => (
                <button key={term} type="button" onClick={() => setForm((prev) => ({ ...prev, termMonths: term }))} className={`rounded-lg border px-2 py-1.5 text-xs ${form.termMonths === term ? "border-accent text-white bg-accent/20" : "border-white/10 text-zinc-400"}`}>{term}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-zinc-300 mb-2">Estimated Credit Tier</p>
            <div className="grid grid-cols-2 gap-2">
              {(["excellent", "good", "fair", "rebuilding"] as CreditTier[]).map((tier) => (
                <button key={tier} type="button" onClick={() => setForm((prev) => ({ ...prev, creditTier: tier }))} className={`rounded-lg border px-3 py-2 text-xs capitalize ${form.creditTier === tier ? "border-accent bg-accent/20 text-white" : "border-white/10 text-zinc-400"}`}>{tier}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input className="input-dark" placeholder="Trade-in value" value={form.tradeInValue || ""} onChange={(e) => setForm((prev) => ({ ...prev, tradeInValue: Number(e.target.value) || 0 }))} />
            <input className="input-dark" placeholder="Trade payoff" value={form.tradePayoff || ""} onChange={(e) => setForm((prev) => ({ ...prev, tradePayoff: Number(e.target.value) || 0 }))} />
          </div>
          <p className="text-xs text-zinc-500">Tax {Math.round(DEAL_DESK_CONFIG.taxAssumptions.taxRate * 10000) / 100}% • Doc fee {money.format(DEAL_DESK_CONFIG.feeAssumptions.docFee)} • Title/Reg {money.format(DEAL_DESK_CONFIG.feeAssumptions.titleAndRegistrationFee)}</p>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-surface-1 p-4 space-y-3 h-fit">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Estimated Results</p>
          <div className="flex justify-between text-sm"><span className="text-zinc-400">Estimated Monthly</span><span className="font-semibold text-accent-light">{money.format(result.estimatedMonthlyPayment)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-zinc-400">Amount Financed</span><span className="text-white">{money.format(result.amountFinanced)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-zinc-400">Trade Difference</span><span className="text-white">{money.format(result.netTrade)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-zinc-400">Out-the-Door Range</span><span className="text-white">{money.format(result.outTheDoorRange.min)} - {money.format(result.outTheDoorRange.max)}</span></div>
          <p className="text-xs text-zinc-500 border-t border-white/10 pt-3">{DEAL_DESK_CONFIG.disclaimer}</p>
        </div>
      </div>

      <div className="sticky bottom-0 md:static bg-surface-2/95 backdrop-blur pt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
        <Button size="md" variant="primary" onClick={() => setOpenRequestType("save_deal")}>{DEAL_DESK_CONFIG.ctaLabels.saveDeal}</Button>
        <Button size="md" variant="outline" onClick={() => setOpenRequestType("test_drive")}>{DEAL_DESK_CONFIG.ctaLabels.testDrive}</Button>
        <Button size="md" variant="outline" onClick={() => setOpenRequestType("walkaround")}>{DEAL_DESK_CONFIG.ctaLabels.walkaround}</Button>
        <Button size="md" variant="ghost" onClick={() => setOpenRequestType("help")}>{DEAL_DESK_CONFIG.ctaLabels.help}</Button>
      </div>

      {openRequestType ? (
        <DealDeskLeadModal
          requestType={openRequestType}
          onClose={() => setOpenRequestType(null)}
          payload={{
            sessionId: getSessionId(),
            vehicleId: vehicle.id,
            vehicleSlug: vehicle.slug,
            stockNumber: vehicle.stockNumber,
            vehicleTitle: vehicle.title,
            vehiclePrice: vehicle.price,
            monthlyEstimateShown: result.estimatedMonthlyPayment,
            outTheDoorEstimateShown: result.estimatedOutTheDoor,
            calculatorSnapshot: snapshot,
          }}
        />
      ) : null}
    </section>
  );
}
