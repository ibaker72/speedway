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
  return (
    <SectionWrapper background="gradient">
      <SectionHeading
        title="Why Speedway Motors"
        subtitle="A straightforward approach to buying a used car."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
        {pillars.slice(0, 4).map((pillar, i) => (
          <AnimateIn key={pillar.title} delay={i * 100} variant="up">
            <div className="text-center rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-7 hover:bg-white/[0.05] hover:border-accent/20 transition-all duration-300 h-full">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-accent/10 border border-accent/10 flex items-center justify-center mb-5">
                <pillar.icon className="h-6 w-6 text-accent" />
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

      {/* 5th pillar centered */}
      <AnimateIn delay={400} variant="up">
        <div className="mt-6 max-w-sm mx-auto text-center rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-7 hover:bg-white/[0.05] hover:border-accent/20 transition-all duration-300">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-accent/10 border border-accent/10 flex items-center justify-center mb-5">
            <Shield className="h-6 w-6 text-accent" />
          </div>
          <h3 className="font-semibold text-white mb-2 text-base">
            {pillars[4].title}
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {pillars[4].description}
          </p>
        </div>
      </AnimateIn>
    </SectionWrapper>
  );
}
