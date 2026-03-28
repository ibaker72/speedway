import { ShieldCheck, BadgeCheck, Clock, CreditCard } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
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
      <SectionWrapper background="charcoal" className="py-14 md:py-20">
        <SectionHeading
          title="Auto Financing"
          subtitle="Flexible financing options designed to work for you. Get pre-approved in minutes with no impact to your credit score."
          as="h1"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {highlights.map((h, i) => (
            <AnimateIn key={h.title} delay={i * 100} variant="up">
              <div className="simple-card p-6 text-center h-full">
                <div className="w-11 h-11 rounded-lg bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <h.icon className="h-5 w-5 text-red-500" />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1.5">
                  {h.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {h.text}
                </p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </SectionWrapper>
      <FinanceFormSection />
    </>
  );
}
