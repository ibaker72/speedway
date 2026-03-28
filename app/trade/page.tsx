import {
  ArrowRightLeft,
  Phone,
  CheckCircle,
  ArrowRight,
  ClipboardCheck,
  Car,
  Banknote,
} from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trade-In Your Vehicle",
  description:
    "Get a competitive trade-in value for your current vehicle at Speedway Motors. Apply the value toward any car in our inventory.",
};

const steps = [
  {
    icon: ClipboardCheck,
    title: "Share Your Details",
    description: "Tell us about your vehicle — make, model, year, mileage, and condition.",
  },
  {
    icon: Car,
    title: "Get Your Estimate",
    description: "We provide a fair market estimate based on current data. No obligation.",
  },
  {
    icon: Banknote,
    title: "Apply Toward Your Next Car",
    description: "Use your trade-in value as a down payment on any vehicle in our inventory.",
  },
];

export default function TradePage() {
  return (
    <>
      <SectionWrapper background="charcoal" className="py-14 md:py-20">
        <SectionHeading
          title="Value Your Trade"
          subtitle="Get a fair market estimate for your current vehicle and apply it toward your next car."
          as="h1"
          label="Trade-In"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <AnimateIn key={step.title} delay={i * 120} variant="up">
              <div className="premium-card p-7 text-center h-full">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/10 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-5 w-5 text-accent" />
                </div>
                <div className="text-xs text-accent font-semibold mb-2">
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
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper background="white">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center mb-6">
            <ArrowRightLeft className="h-8 w-8 text-zinc-600" />
          </div>
          <h2 className="text-2xl font-display text-zinc-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-zinc-500 mb-4 leading-relaxed">
            Bring your vehicle to any of our Paterson locations for a quick,
            no-obligation appraisal. Or call us to discuss your trade-in over
            the phone.
          </p>
          <ul className="inline-flex flex-col gap-2 mb-8 text-left mx-auto">
            {[
              "Competitive market-based values",
              "Quick, no-obligation process",
              "Apply value toward any vehicle",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-sm text-zinc-600"
              >
                <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button href={BUSINESS.phoneHref} variant="primary" size="lg">
              <Phone className="h-4 w-4" />
              Call {BUSINESS.phone}
            </Button>
            <Button href="/inventory" variant="outline" size="lg">
              Browse Inventory
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
