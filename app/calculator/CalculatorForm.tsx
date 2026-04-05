"use client";

import { useState } from "react";
import { DollarSign, Calendar, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";

const CREDIT_RANGES = [
  { label: "Excellent (720+)", rate: 4.5 },
  { label: "Good (680–719)", rate: 6.5 },
  { label: "Fair (620–679)", rate: 9.5 },
  { label: "Rebuilding (<620)", rate: 14.0 },
];

const TERMS = [36, 48, 60, 72, 84];

export function CalculatorForm({ initialPrice }: { initialPrice?: number }) {
  const [price, setPrice] = useState(initialPrice && initialPrice >= 5000 && initialPrice <= 75000 ? initialPrice : 25000);
  const [downPayment, setDownPayment] = useState(2000);
  const [term, setTerm] = useState(60);
  const [creditIndex, setCreditIndex] = useState(0);

  const rate = CREDIT_RANGES[creditIndex].rate / 100 / 12;
  const principal = Math.max(price - downPayment, 0);
  const monthly = rate > 0
    ? Math.round((principal * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1))
    : Math.round(principal / term);
  const totalPaid = monthly * term;
  const totalInterest = totalPaid - principal;
  const interestPercent = totalPaid > 0 ? Math.round((totalInterest / totalPaid) * 100) : 0;
  const principalPercent = 100 - interestPercent;

  return (
    <div className="rounded-2xl border border-white/8 bg-surface-2 p-6 md:p-8 space-y-8">
      {/* Vehicle Price */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-accent" />
            Vehicle Price
          </label>
          <span className="text-lg font-bold text-white">${price.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={5000}
          max={75000}
          step={500}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="w-full h-2 bg-white/8 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(211,17,25,0.4)]"
        />
        <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
          <span>$5,000</span><span>$75,000</span>
        </div>
      </div>

      {/* Down Payment */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-accent" />
            Down Payment
          </label>
          <span className="text-lg font-bold text-white">${downPayment.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={0}
          max={20000}
          step={500}
          value={downPayment}
          onChange={(e) => setDownPayment(Number(e.target.value))}
          className="w-full h-2 bg-white/8 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(211,17,25,0.4)]"
        />
        <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
          <span>$0</span><span>$20,000</span>
        </div>
      </div>

      {/* Credit Range */}
      <div>
        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2 mb-3">
          <Percent className="h-4 w-4 text-accent" />
          Credit Range (Est. APR: {CREDIT_RANGES[creditIndex].rate}%)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CREDIT_RANGES.map((cr, i) => (
            <button
              key={cr.label}
              type="button"
              onClick={() => setCreditIndex(i)}
              className={`py-2.5 px-3 rounded-xl text-xs font-medium transition-colors ${
                creditIndex === i
                  ? "bg-accent/20 text-accent-light border border-accent/30"
                  : "bg-white/4 text-zinc-400 border border-white/6 hover:bg-white/8"
              }`}
            >
              {cr.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loan Term */}
      <div>
        <label className="text-sm font-medium text-zinc-300 flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-accent" />
          Loan Term
        </label>
        <div className="grid grid-cols-5 gap-2">
          {TERMS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTerm(t)}
              className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
                term === t
                  ? "bg-accent/20 text-accent-light border border-accent/30"
                  : "bg-white/4 text-zinc-400 border border-white/6 hover:bg-white/8"
              }`}
            >
              {t} mo
            </button>
          ))}
        </div>
      </div>

      {/* Result */}
      <div className="bg-surface-1 border border-white/6 rounded-2xl p-6 text-center">
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Estimated Monthly Payment</p>
        <p className="text-5xl font-bold text-white">
          ${monthly.toLocaleString()}
          <span className="text-lg font-normal text-zinc-400">/mo</span>
        </p>

        {/* Visual breakdown bar */}
        <div className="mt-6 mx-auto max-w-xs">
          <div className="flex rounded-full overflow-hidden h-3">
            <div
              className="bg-accent transition-all duration-300"
              style={{ width: `${principalPercent}%` }}
            />
            <div
              className="bg-zinc-600 transition-all duration-300"
              style={{ width: `${interestPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-zinc-400">Principal: ${principal.toLocaleString()}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-600" />
              <span className="text-zinc-400">Interest: ${totalInterest.toLocaleString()}</span>
            </span>
          </div>
        </div>

        <p className="mt-4 text-xs text-zinc-600">
          Total paid over {term} months: ${totalPaid.toLocaleString()}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button href="/finance" variant="primary" size="lg" className="flex-1">
          Get Pre-Approved
        </Button>
        <Button href="/inventory" variant="outline" size="lg" className="flex-1">
          Browse Inventory
        </Button>
      </div>

      <p className="text-[10px] text-zinc-600 text-center">
        This calculator provides estimates only and does not constitute a financing offer.
        Actual terms may vary. Taxes, title, and fees not included.
      </p>
    </div>
  );
}
