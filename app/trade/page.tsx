import {
  ClipboardCheck,
  Car,
  Banknote,
} from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { TradeInForm } from "@/components/forms/TradeInForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trade In Your Car in Paterson, NJ | Speedway Motors",
  description:
    "Get a competitive trade-in value for your vehicle at Speedway Motors in Paterson, NJ. Instant estimates and apply the value toward any car in our inventory.",
  alternates: {
    canonical: "https://www.speedwaymotorsllc.com/trade",
  },
};

const steps = [
  {
    icon: ClipboardCheck,
    title: "Share Your Details",
    description:
      "Tell us about your vehicle — make, model, year, mileage, and condition.",
  },
  {
    icon: Car,
    title: "Get Your Estimate",
    description:
      "We provide a fair market estimate based on current data. No obligation.",
  },
  {
    icon: Banknote,
    title: "Apply Toward Your Next Car",
    description:
      "Use your trade-in value as a down payment on any vehicle in our inventory.",
  },
];

export default function TradePage() {
  return (
    <>
      <PageHero
        eyebrow="Trade-In"
        title="Trade In Your Car in Paterson, NJ"
        subtitle="Get a fair market estimate for your current vehicle and apply it toward your next car."
      />

      <SectionWrapper background="charcoal">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <AnimateIn key={step.title} delay={i * 120} variant="up">
                <div className="card-glass p-7 text-center h-full">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/15 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-5 w-5 text-accent-light" />
                  </div>
                  <div className="text-xs text-accent-light font-semibold mb-2">
                    Step {i + 1}
                  </div>
                  <h3 className="font-semibold text-white mb-2 text-[15px]">
                    {step.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </AnimateIn>
            );
          })}
        </div>
      </SectionWrapper>

      <SectionWrapper background="dark">
        <div className="max-w-2xl mx-auto">
          <TradeInForm />
        </div>
      </SectionWrapper>
    </>
  );
}
