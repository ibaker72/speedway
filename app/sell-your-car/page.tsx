import {
  DollarSign,
  Phone,
  CheckCircle,
  ArrowRight,
  FileText,
  HandCoins,
  BadgeCheck,
} from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sell Your Car",
  description:
    "Sell your car directly to Speedway Motors — no trade required. Get a competitive offer and get paid fast.",
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
        title="Sell Your Car"
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
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 mx-auto rounded-xl bg-accent/10 border border-accent/15 flex items-center justify-center mb-6">
            <DollarSign className="h-8 w-8 text-accent-light" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            We Buy Cars, Trucks, SUVs & Vans
          </h2>
          <p className="text-zinc-400 mb-4 leading-relaxed">
            Get a competitive cash offer for your vehicle. The process is quick,
            transparent, and completely hassle-free.
          </p>
          <ul className="inline-flex flex-col gap-2 mb-8 text-left mx-auto">
            {[
              "Competitive cash offers",
              "Quick and transparent process",
              "No purchase required — just sell and go",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-sm text-zinc-300"
              >
                <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button href={BUSINESS.phoneHref} variant="primary" size="lg">
              <Phone className="h-4 w-4" />
              Call {BUSINESS.phone}
            </Button>
            <Button href="/contact" variant="outline" size="lg">
              Contact Us
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
