"use client";

import { useState } from "react";
import { CheckCircle, CreditCard, Clock, Shield, FileText } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-white mb-4">
            Financing Made Simple
          </h2>
          <p className="text-zinc-400 mb-8 leading-relaxed">
            Don&apos;t let credit hold you back. We work with multiple lenders
            across New Jersey to find the best rate for your situation.
          </p>
          <ul className="space-y-4">
            {benefits.map((b) => (
              <li key={b.text} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <b.icon className="h-4 w-4 text-amber-400" />
                </div>
                <span className="text-zinc-300 text-sm leading-relaxed">
                  {b.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm p-6 sm:p-8">
          {submitted ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 mx-auto rounded-full bg-green-900/30 flex items-center justify-center mb-4">
                <CheckCircle className="h-7 w-7 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Thank You!
              </h3>
              <p className="text-zinc-400 text-sm">
                We&apos;ve received your application. A member of our finance
                team will be in touch shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
              <h3 className="text-lg font-bold text-white mb-1">
                Get Pre-Approved
              </h3>
              <p className="text-xs text-zinc-500 mb-4">
                No impact to your credit score.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <input
                  {...hydrationGuard}
                  type="text"
                  placeholder="First Name"
                  required
                  className="col-span-1 rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-700"
                />
                <input
                  {...hydrationGuard}
                  type="text"
                  placeholder="Last Name"
                  required
                  className="col-span-1 rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-700"
                />
              </div>
              <input
                {...hydrationGuard}
                type="email"
                placeholder="Email Address"
                required
                className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-700"
              />
              <input
                {...hydrationGuard}
                type="tel"
                placeholder="Phone Number"
                required
                className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-700"
              />
              <select
                {...hydrationGuard}
                required
                defaultValue=""
                className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-700"
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
                className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-700"
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
                className="w-full rounded-lg bg-red-700 hover:bg-red-800 text-white font-semibold py-3 text-sm transition-colors"
              >
                Submit Application
              </button>
            </form>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}
