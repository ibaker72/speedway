import {
  FileText,
  HandCoins,
  BadgeCheck,
} from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { SellCarForm } from "@/components/forms/SellCarForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sell Your Car in Paterson, NJ | Cash Offers | Speedway Motors",
  description:
    "Sell your car in Paterson, NJ directly to Speedway Motors — no trade required. Get a competitive cash offer and get paid fast. Quick, transparent process.",
  alternates: {
    canonical: "https://www.speedwaymotorsllc.com/sell-your-car",
  },
};

const steps = [
  {
    icon: FileText,
    title: "Submit Your Details",
    description:
      "Share basic info about your vehicle — year, make, model, mileage, and condition.",
  },
  {
    icon: HandCoins,
    title: "Receive Your Offer",
    description:
      "We provide a competitive cash offer based on current market values.",
  },
  {
    icon: BadgeCheck,
    title: "Get Paid",
    description:
      "Accept the offer, bring your vehicle in, and walk away with payment. It's that simple.",
  },
];

export default function SellYourCarPage() {
  return (
    <>
      <PageHero
        eyebrow="Sell Your Vehicle"
        title="Sell Your Car in Paterson, NJ"
        subtitle="We purchase vehicles directly — no trade required. Quick, transparent, and hassle-free."
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
          <SellCarForm />
        </div>
      </SectionWrapper>
    </>
  );
}
