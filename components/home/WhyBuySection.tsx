import { ShieldCheck, Banknote, Eye, Headphones, Shield } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { AnimateIn } from "@/components/shared/AnimateIn";

const pillars = [
  {
    icon: ShieldCheck,
    title: "Quality Inspected",
    description:
      "Every vehicle undergoes a thorough inspection before it reaches our lot. We stand behind the quality of our inventory.",
  },
  {
    icon: Banknote,
    title: "Flexible Financing",
    description:
      "We work with multiple lenders to find competitive rates for every credit profile. First-time buyers and rebuilders welcome.",
  },
  {
    icon: Eye,
    title: "Transparent Pricing",
    description:
      "No hidden fees, no bait-and-switch. Our prices are clearly listed and competitively set based on current market data.",
  },
  {
    icon: Headphones,
    title: "Personal Service",
    description:
      "Our team takes the time to understand what you need. We help you find the right vehicle, not just make a sale.",
  },
  {
    icon: Shield,
    title: "Extended Warranties",
    description:
      "Many vehicles qualify for extended service contracts, giving you added protection and peace of mind on the road.",
  },
];

export function WhyBuySection() {
  return (
    <SectionWrapper background="dark">
      <SectionHeading
        title="Why Speedway Motors"
        subtitle="A straightforward approach to buying a used car."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {pillars.map((pillar, i) => (
          <AnimateIn key={pillar.title} delay={i * 80} variant="up">
            <div className="simple-card p-7 h-full">
              <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-5">
                <pillar.icon className="h-5 w-5 text-red-500" />
              </div>
              <h3 className="font-semibold text-white mb-2 text-base">
                {pillar.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {pillar.description}
              </p>
            </div>
          </AnimateIn>
        ))}
      </div>
    </SectionWrapper>
  );
}
