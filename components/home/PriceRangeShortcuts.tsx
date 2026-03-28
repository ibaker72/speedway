import Link from "next/link";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { AnimateIn } from "@/components/shared/AnimateIn";

const priceRanges = [
  { label: "Under $10K", href: "/inventory?priceMax=10000", estimate: "25+" },
  { label: "$10K – $15K", href: "/inventory?priceMin=10000&priceMax=15000", estimate: "40+" },
  { label: "$15K – $20K", href: "/inventory?priceMin=15000&priceMax=20000", estimate: "50+" },
  { label: "$20K+", href: "/inventory?priceMin=20000", estimate: "65+" },
];

export function PriceRangeShortcuts() {
  return (
    <SectionWrapper background="elevated">
      <SectionHeading
        title="Shop by Budget"
        subtitle="Quality vehicles at every price point."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {priceRanges.map((range, i) => (
          <AnimateIn key={range.label} delay={i * 60} variant="up">
            <Link
              href={range.href}
              className="group p-6 md:p-7 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-accent/30 hover:bg-white/[0.04] transition-all duration-300 text-center block"
            >
              <div className="text-2xl md:text-3xl font-bold text-white group-hover:text-accent-light transition-colors">
                {range.label}
              </div>
              <div className="text-xs text-zinc-500 mt-2">
                {range.estimate} vehicles
              </div>
            </Link>
          </AnimateIn>
        ))}
      </div>
    </SectionWrapper>
  );
}
