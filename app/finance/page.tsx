import { ShieldCheck, BadgeCheck, Clock, CreditCard, CircleCheck } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auto Financing",
  description:
    "Get pre-approved for auto financing at Speedway Motors. All credit levels welcome. Quick decisions and competitive rates from trusted NJ lenders.",
};

const highlights = [
  {
    icon: CreditCard,
    title: "All Credit Welcome",
    text: "Good, fair, rebuilding, or first-time — we find options for every situation.",
  },
  {
    icon: Clock,
    title: "Same-Day Decisions",
    text: "Most applications are processed and approved the same business day.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted Lenders",
    text: "We partner with major banks and lending institutions across New Jersey.",
  },
  {
    icon: BadgeCheck,
    title: "No Pressure",
    text: "Get pre-approved with no obligation. Your information stays secure and private.",
  },
];

const steps = [
  "Personal details",
  "Employment & income",
  "Vehicle preferences",
  "Review & submit",
];

export default function FinancePage() {
  return (
    <>
      <PageHero
        eyebrow="Financing Solutions"
        title="Auto Financing"
        subtitle="Flexible financing options designed to work for you. Get pre-approved in minutes with no impact to your credit score."
      />

      <SectionWrapper background="charcoal">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {highlights.map((h, i) => {
            const Icon = h.icon;
            return (
              <AnimateIn key={h.title} delay={i * 100} variant="up">
                <div className="card-glass p-6 text-center h-full">
                  <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/15 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-5 w-5 text-accent-light" />
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-1.5">
                    {h.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {h.text}
                  </p>
                </div>
              </AnimateIn>
            );
          })}
        </div>
      </SectionWrapper>

      <SectionWrapper background="elevated">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-10">
          <AnimateIn variant="left">
            <aside className="rounded-2xl bg-[#111111] border border-white/10 p-6 lg:sticky lg:top-28 h-fit">
              <p className="text-[11px] tracking-[0.2em] uppercase text-accent-light font-semibold mb-5">Application Steps</p>
              <ol className="space-y-4">
                {steps.map((step, index) => (
                  <li key={step} className="flex items-center gap-3 text-sm text-zinc-300">
                    <span className="w-7 h-7 rounded-full bg-accent/15 border border-accent/25 text-accent-light flex items-center justify-center font-semibold text-xs">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </aside>
          </AnimateIn>

          <AnimateIn variant="up" delay={120}>
            <form className="rounded-2xl bg-[#1A1A1A] border border-white/10 p-6 sm:p-8 space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">Step 1 — Personal Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input className="input-dark" placeholder="First Name" />
                  <input className="input-dark" placeholder="Last Name" />
                  <input className="input-dark" placeholder="Email Address" type="email" />
                  <input className="input-dark" placeholder="Phone Number" type="tel" />
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">Step 2 — Employment & Income</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input className="input-dark" placeholder="Employer" />
                  <input className="input-dark" placeholder="Job Title" />
                  <input className="input-dark" placeholder="Monthly Income" />
                  <select className="select-dark" defaultValue="">
                    <option value="" disabled>Residence Status</option>
                    <option>Own</option>
                    <option>Rent</option>
                    <option>Living with Family</option>
                  </select>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white mb-4">Step 3 — Vehicle Preferences</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select className="select-dark" defaultValue="">
                    <option value="" disabled>Vehicle Type</option>
                    <option>Sedan</option>
                    <option>SUV</option>
                    <option>Truck</option>
                  </select>
                  <input className="input-dark" placeholder="Estimated Down Payment" />
                  <input className="input-dark" placeholder="Estimated Monthly Budget" />
                </div>
              </section>

              <section className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-zinc-200 flex items-start gap-3">
                <CircleCheck className="h-5 w-5 text-emerald-400 mt-0.5" />
                <p>
                  Step 4 — Review & submit: This is a UI-ready multi-step layout stub. Hook this to your backend endpoint when ready.
                </p>
              </section>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                <Button type="button" variant="outline" size="lg" className="rounded-[2px] uppercase tracking-[0.08em] border-white/40">
                  Save & Continue Later
                </Button>
                <Button type="submit" variant="primary" size="lg" className="rounded-[2px] uppercase tracking-[0.08em]">
                  Submit Application
                </Button>
              </div>
            </form>
          </AnimateIn>
        </div>
      </SectionWrapper>
    </>
  );
}
