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
    <SectionWrapper background="light">
      <SectionHeading
        title="Shop by Budget"
        subtitle="Quality vehicles at every price point."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {priceRanges.map((range, i) => (
          <AnimateIn key={range.label} delay={i * 80} variant="up">
            <Link
              href={range.href}
              className="group relative p-6 md:p-7 bg-white rounded-2xl border border-zinc-200/80 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 text-center overflow-hidden"
            >
              {/* Subtle accent glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/0 group-hover:from-accent/[0.02] group-hover:to-accent/[0.05] transition-all duration-500 rounded-2xl" />
              <div className="relative">
                <div className="font-display text-2xl md:text-3xl font-bold text-zinc-900 group-hover:text-accent transition-colors duration-300">
                  {range.label}
                </div>
                <div className="text-xs text-zinc-500 mt-2">
                  {range.estimate} vehicles
                </div>
              </div>
            </Link>
          </AnimateIn>
        ))}
      </div>
    </SectionWrapper>
  );
}
