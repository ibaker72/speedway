import Link from "next/link";
import { Tag } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";

const priceRanges = [
  { label: "Under $10K", href: "/inventory?priceMax=10000", estimate: "25+" },
  { label: "$10K – $15K", href: "/inventory?priceMin=10000&priceMax=15000", estimate: "40+" },
  { label: "$15K – $20K", href: "/inventory?priceMin=15000&priceMax=20000", estimate: "50+" },
  { label: "$20K+", href: "/inventory?priceMin=20000", estimate: "65+" },
];

export function PriceRangeShortcuts() {
  return (
    <SectionWrapper background="white">
      <SectionHeading
        title="Shop by Price"
        subtitle="Find a quality vehicle that fits your budget."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {priceRanges.map((range) => (
          <Link
            key={range.label}
            href={range.href}
            className="group flex flex-col items-center gap-3 p-6 bg-zinc-50 rounded-xl border border-zinc-200 hover:border-amber-300 hover:shadow-md transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-full bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
              <Tag className="h-5 w-5 text-amber-700" />
            </div>
            <div className="text-center">
              <div className="font-bold font-display text-zinc-900 text-lg">
                {range.label}
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">
                {range.estimate} vehicles
              </div>
            </div>
          </Link>
        ))}
      </div>
    </SectionWrapper>
  );
}
