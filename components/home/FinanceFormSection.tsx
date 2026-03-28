"use client";

import { useState } from "react";
import { CheckCircle, CreditCard, Clock, Shield, FileText } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { AnimateIn } from "@/components/shared/AnimateIn";

const benefits = [
  { icon: CreditCard, text: "All credit levels welcome — good, fair, or rebuilding" },
  { icon: Shield, text: "Competitive rates from trusted NJ lenders" },
  { icon: Clock, text: "Quick decisions — most approvals same day" },
  { icon: FileText, text: "We handle the entire A-to-Z process for you" },
];

export function FinanceFormSection() {
  const [submitted, setSubmitted] = useState(false);
  const hydrationGuard = { suppressHydrationWarning: true };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <SectionWrapper background="charcoal">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
        <AnimateIn variant="left">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-accent" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
                Financing
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display tracking-tight text-white mb-5">
              Financing Made Simple
            </h2>
            <p className="text-zinc-400 mb-10 leading-relaxed text-lg">
              Don&apos;t let credit hold you back. We work with multiple lenders
              across New Jersey to find the best rate for your situation.
            </p>
            <ul className="space-y-5">
              {benefits.map((b) => (
                <li key={b.text} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <b.icon className="h-5 w-5 text-accent" />
                  </div>
                  <span className="text-zinc-300 leading-relaxed">
                    {b.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </AnimateIn>

        <AnimateIn variant="right" delay={150}>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-7 sm:p-9 shadow-2xl shadow-black/20">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-5">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="text-xl font-display text-white mb-2">
                  Thank You!
                </h3>
                <p className="text-zinc-400 text-sm">
                  We&apos;ve received your application. A member of our finance
                  team will be in touch shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
                <h3 className="text-xl font-display text-white mb-1">
                  Get Pre-Approved
                </h3>
                <p className="text-xs text-zinc-500 mb-5">
                  No impact to your credit score. Quick and confidential.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    {...hydrationGuard}
                    type="text"
                    placeholder="First Name"
                    required
                    className="premium-input"
                  />
                  <input
                    {...hydrationGuard}
                    type="text"
                    placeholder="Last Name"
                    required
                    className="premium-input"
                  />
                </div>
                <input
                  {...hydrationGuard}
                  type="email"
                  placeholder="Email Address"
                  required
                  className="premium-input"
                />
                <input
                  {...hydrationGuard}
                  type="tel"
                  placeholder="Phone Number"
                  required
                  className="premium-input"
                />
                <select
                  {...hydrationGuard}
                  required
                  defaultValue=""
                  className="premium-input"
                >
                  <option value="" disabled>
                    Credit Range
                  </option>
                  <option value="excellent">Excellent (720+)</option>
                  <option value="good">Good (680–719)</option>
                  <option value="fair">Fair (620–679)</option>
                  <option value="rebuilding">Rebuilding (&lt;620)</option>
                  <option value="no-credit">No Credit History</option>
                </select>
                <select
                  {...hydrationGuard}
                  defaultValue=""
                  className="premium-input"
                >
                  <option value="" disabled>
                    Vehicle Interest
                  </option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV / Crossover</option>
                  <option value="truck">Truck</option>
                  <option value="van">Van / Minivan</option>
                  <option value="luxury">Luxury</option>
                  <option value="unsure">Not Sure Yet</option>
                </select>
                <button
                  {...hydrationGuard}
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white font-semibold py-3.5 text-sm transition-all duration-200 shadow-lg shadow-red-900/20 mt-2"
                >
                  Submit Application
                </button>
                <p className="text-[11px] text-zinc-600 text-center mt-3">
                  Your information is secure and will not be shared.
                </p>
              </form>
            )}
          </div>
        </AnimateIn>
      </div>
    </SectionWrapper>
  );
}
