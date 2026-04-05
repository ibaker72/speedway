import { Shield, Wrench, Clock, CheckCircle, Phone, ArrowRight } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { InlineLeadCTA } from "@/components/shared/InlineLeadCTA";
import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Warranty & Service",
  description:
    "Explore warranty options, service contracts, and maintenance packages available at Speedway Motors LLC in Paterson, NJ.",
  alternates: {
    canonical: "https://www.speedwaymotorsllc.com/warranty",
  },
};

const warranties = [
  {
    icon: Shield,
    title: "Powertrain Warranty",
    description:
      "Covers the engine, transmission, and drivetrain components. Available on eligible vehicles for up to 36 months or 36,000 miles.",
    features: [
      "Engine & transmission coverage",
      "Drivetrain protection",
      "Nationwide repair network",
      "Transferable to new owner",
    ],
  },
  {
    icon: Wrench,
    title: "Comprehensive Coverage",
    description:
      "Extended protection that goes beyond powertrain to cover electrical, A/C, suspension, and more. Peace of mind for the long haul.",
    features: [
      "Electrical system coverage",
      "A/C & heating",
      "Suspension & steering",
      "Roadside assistance included",
    ],
  },
  {
    icon: Clock,
    title: "Maintenance Packages",
    description:
      "Pre-paid maintenance plans that cover routine services like oil changes, tire rotations, and brake inspections at discounted rates.",
    features: [
      "Oil changes & fluid top-offs",
      "Tire rotation & balancing",
      "Brake inspections",
      "Multi-point vehicle checkup",
    ],
  },
];

export default function WarrantyPage() {
  return (
    <>
      <PageHero
        eyebrow="Protection Plans"
        title="Warranty & Service"
        subtitle="Drive with confidence. We offer extended warranties, service contracts, and maintenance packages to keep you covered."
      />

      <SectionWrapper background="charcoal">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {warranties.map((w, i) => {
            const Icon = w.icon;
            return (
              <AnimateIn key={w.title} delay={i * 120} variant="up">
                <div className="card-glass p-7 h-full flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/15 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-accent-light" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{w.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-5">
                    {w.description}
                  </p>
                  <ul className="mt-auto space-y-2">
                    {w.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimateIn>
            );
          })}
        </div>
      </SectionWrapper>

      <SectionWrapper background="dark">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Questions About Coverage?
          </h2>
          <p className="text-zinc-400 mb-8 leading-relaxed">
            Our team can walk you through all available warranty and service options for any vehicle in our inventory. Every plan is tailored to your needs and budget.
          </p>
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

      <SectionWrapper background="charcoal">
        <div className="max-w-3xl mx-auto">
          <InlineLeadCTA variant="buying-guide" />
        </div>
      </SectionWrapper>
    </>
  );
}
