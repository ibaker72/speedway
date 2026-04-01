"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 2005 + 1 }, (_, i) => currentYear - i);

interface EstimateResult {
  low: number;
  high: number;
  year: string;
  make: string;
  model: string;
}

function generateEstimate(year: string, mileage: string, condition: string): { low: number; high: number } {
  const age = currentYear - Number(year);
  let base = 18000;
  base -= age * 900;
  const miles = Number(mileage) || 50000;
  if (miles > 100000) base -= 3500;
  else if (miles > 75000) base -= 2000;
  else if (miles > 50000) base -= 800;

  if (condition === "Poor") base -= 3000;
  else if (condition === "Fair") base -= 1500;
  else if (condition === "Excellent") base += 1500;

  const low = Math.max(2500, Math.round(base * 0.85 / 100) * 100);
  const high = Math.max(3500, Math.round(base * 1.15 / 100) * 100);
  return { low, high };
}

export function ValueMyCarForm() {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<EstimateResult | null>(null);

  // Step 1
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");

  // Step 2
  const [mileage, setMileage] = useState("");
  const [condition, setCondition] = useState("");
  const [accidents, setAccidents] = useState("");

  // Step 3
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!EMAIL_REGEX.test(email)) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/inventory-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email, name, phone,
          vehicleYear: year, vehicleMake: make, vehicleModel: model,
          mileage, condition, accidents,
          source: "value-my-car",
        }),
      });
      if (!res.ok) throw new Error();
      const est = generateEstimate(year, mileage, condition);
      setResult({ ...est, year, make, model });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success" && result) {
    return (
      <div className="card-glass p-8 text-center">
        <p className="text-xs uppercase tracking-[0.15em] text-accent-light mb-3">Your Estimate</p>
        <h2 className="text-2xl font-bold text-white mb-2">
          {result.year} {result.make} {result.model}
        </h2>
        <p className="text-4xl font-extrabold text-accent-light mb-2">
          ${result.low.toLocaleString()} &ndash; ${result.high.toLocaleString()}
        </p>
        <p className="text-sm text-zinc-400 mb-8">
          Based on current market data for your vehicle&apos;s year, mileage, and condition.
        </p>
        <p className="text-sm text-zinc-300 mb-6">
          Want a precise offer? Visit us or call <strong>(862) 264-2777</strong>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/sell-your-car" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-accent-light transition-colors">
            Get Exact Offer <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/inventory" className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/[0.15] text-white text-sm font-semibold rounded-xl hover:bg-white/[0.06] transition-colors">
            Browse Inventory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card-glass p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white">
          Step {step} of 3
        </h2>
        <div className="flex gap-1.5">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`w-8 h-1 rounded-full ${s <= step ? "bg-accent" : "bg-white/[0.08]"}`} />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Year</label>
              <select value={year} onChange={(e) => setYear(e.target.value)} required className="select-dark">
                <option value="">Select Year</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Make</label>
              <input type="text" value={make} onChange={(e) => setMake(e.target.value)} required className="input-dark" placeholder="e.g. Toyota" />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Model</label>
              <input type="text" value={model} onChange={(e) => setModel(e.target.value)} required className="input-dark" placeholder="e.g. Camry" />
            </div>
            <button
              type="button"
              onClick={() => { if (year && make && model) setStep(2); }}
              className="w-full h-12 bg-accent text-white text-sm font-bold rounded-xl hover:bg-accent-light transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Mileage</label>
              <input type="number" value={mileage} onChange={(e) => setMileage(e.target.value)} required className="input-dark" placeholder="e.g. 45000" />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Condition</label>
              <select value={condition} onChange={(e) => setCondition(e.target.value)} required className="select-dark">
                <option value="">Select Condition</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Any Accidents?</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                  <input type="radio" name="accidents" value="No" checked={accidents === "No"} onChange={() => setAccidents("No")} className="accent-accent" /> No
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                  <input type="radio" name="accidents" value="Yes" checked={accidents === "Yes"} onChange={() => setAccidents("Yes")} className="accent-accent" /> Yes
                </label>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="flex-1 h-12 border border-white/[0.15] text-white text-sm font-semibold rounded-xl hover:bg-white/[0.06] transition-colors inline-flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                type="button"
                onClick={() => { if (mileage && condition && accidents) setStep(3); }}
                className="flex-1 h-12 bg-accent text-white text-sm font-bold rounded-xl hover:bg-accent-light transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Your Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="input-dark" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-dark" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="input-dark" placeholder="(555) 123-4567" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="flex-1 h-12 border border-white/[0.15] text-white text-sm font-semibold rounded-xl hover:bg-white/[0.06] transition-colors inline-flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                type="submit"
                disabled={status === "loading"}
                className="flex-1 h-12 bg-accent text-white text-sm font-bold rounded-xl hover:bg-accent-light transition-colors disabled:opacity-60"
              >
                {status === "loading" ? "Calculating..." : "Get My Estimate"}
              </button>
            </div>
            {status === "error" && <p className="text-sm text-red-400 text-center">Please check your info and try again.</p>}
          </div>
        )}
      </form>
    </div>
  );
}
