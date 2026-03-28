import { ShieldCheck, BadgeCheck, Clock, CreditCard } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { FinanceFormSection } from "@/components/home/FinanceFormSection";
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

      <FinanceFormSection />
    </>
  );
}
