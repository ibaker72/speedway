"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface PaymentCalculatorProps {
  price: number;
  defaultPayment: number;
}

const TERM_OPTIONS = [36, 48, 60, 72];

export function PaymentCalculator({ price, defaultPayment }: PaymentCalculatorProps) {
  const [open, setOpen] = useState(false);
  const [downPayment, setDownPayment] = useState(0);
  const [term, setTerm] = useState(72);

  const monthly = Math.round(((price - downPayment) / term) * 1.05);

  return (
    <div>
      <div className="mt-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
        <p className="text-sm text-emerald-400 font-medium">
          Est. ${open ? monthly : defaultPayment}/mo
        </p>
        <p className="text-xs text-emerald-500/70">
          Based on {term} months with approved credit
        </p>
      </div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors"
      >
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        Calculate Payment
      </button>
      {open && (
        <div className="mt-3 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl space-y-4 animate-[fadeIn_0.2s_ease-out]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-zinc-400">Down Payment</label>
              <span className="text-xs font-medium text-white">${downPayment.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={0}
              max={10000}
              step={500}
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              className="w-full h-1.5 bg-white/[0.08] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-2 block">Loan Term</label>
            <div className="grid grid-cols-4 gap-2">
              {TERM_OPTIONS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTerm(t)}
                  className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                    term === t
                      ? "bg-accent/20 text-accent-light border border-accent/30"
                      : "bg-white/[0.04] text-zinc-400 border border-white/[0.06] hover:bg-white/[0.08]"
                  }`}
                >
                  {t} mo
                </button>
              ))}
            </div>
          </div>
          <div className="pt-3 border-t border-white/[0.06] text-center">
            <p className="text-2xl font-bold text-white">${monthly}<span className="text-sm font-normal text-zinc-400">/mo</span></p>
            <p className="text-[10px] text-zinc-600 mt-1">Estimate only. Does not include taxes, fees, or insurance.</p>
          </div>
        </div>
      )}
    </div>
  );
}
