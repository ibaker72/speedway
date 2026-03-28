import { ShieldCheck, Banknote, Eye, Headphones, Shield } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";

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
      "Our team takes the time to understand what you need. We're here to help you find the right vehicle, not just make a sale.",
  },
  {
    icon: Shield,
    title: "Extended Warranties",
    description:
      "Many vehicles qualify for extended service contracts and warranty coverage, giving you added protection and peace of mind.",
  },
];

export function WhyBuySection() {
  const FifthIcon = pillars[4].icon;

  return (
    <SectionWrapper background="light">
      <SectionHeading
        title="Why Speedway Motors"
        subtitle="A straightforward approach to buying a used car."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {pillars.slice(0, 4).map((pillar) => (
          <div key={pillar.title} className="text-center">
            <div className="mx-auto w-12 h-12 rounded-lg bg-red-700/10 flex items-center justify-center mb-4">
              <pillar.icon className="h-6 w-6 text-red-700" />
            </div>
            <h3 className="font-semibold text-zinc-900 mb-2">{pillar.title}</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              {pillar.description}
            </p>
          </div>
        ))}
      </div>
      {/* 5th pillar centered */}
      <div className="mt-8 max-w-xs mx-auto text-center">
        <div className="mx-auto w-12 h-12 rounded-lg bg-red-700/10 flex items-center justify-center mb-4">
          <FifthIcon className="h-6 w-6 text-red-700" />
        </div>
        <h3 className="font-semibold text-zinc-900 mb-2">{pillars[4].title}</h3>
        <p className="text-sm text-zinc-500 leading-relaxed">
          {pillars[4].description}
        </p>
      </div>
    </SectionWrapper>
  );
}
