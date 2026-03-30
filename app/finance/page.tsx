import { ShieldCheck, BadgeCheck, Clock, CreditCard } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { FinanceApplicationForm } from "@/components/forms/FinanceApplicationForm";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { BUSINESS } from "@/lib/constants";
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
      <BreadcrumbJsonLd items={[{ name: "Home", url: `${BUSINESS.website}/` }, { name: "Financing", url: `${BUSINESS.website}/finance` }]} />
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
            <aside className="rounded-2xl bg-[#111111] border border-white/[0.06] p-6 lg:sticky lg:top-28 h-fit">
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
            <FinanceApplicationForm />
          </AnimateIn>
        </div>
      </SectionWrapper>
    </>
  );
}
