import Link from "next/link";
import { Tag } from "lucide-react";
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
        title="Shop by Price"
        subtitle="Find a quality vehicle that fits your budget."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {priceRanges.map((range, i) => (
          <AnimateIn key={range.label} delay={i * 80} variant="up">
            <Link
              href={range.href}
              className="group flex flex-col items-center gap-4 p-7 bg-white rounded-2xl border border-zinc-200/80 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 group-hover:from-accent/15 group-hover:to-accent/5 flex items-center justify-center transition-all duration-300">
                <Tag className="h-6 w-6 text-accent" />
              </div>
              <div className="text-center">
                <div className="font-display text-xl font-bold text-zinc-900 group-hover:text-accent transition-colors duration-300">
                  {range.label}
                </div>
                <div className="text-xs text-zinc-500 mt-1">
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
