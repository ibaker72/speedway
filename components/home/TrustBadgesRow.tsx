import { Shield, Car, Star, CheckCircle } from "lucide-react";
import { BUSINESS } from "@/lib/constants";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { AnimateIn } from "@/components/shared/AnimateIn";

const badges = [
  {
    icon: Shield,
    value: `${BUSINESS.stats.yearsInBusiness}+`,
    label: "Years in Business",
  },
  {
    icon: Car,
    value: `${BUSINESS.stats.vehiclesInStock}+`,
    label: "Vehicles in Stock",
  },
  {
    icon: Star,
    value: `${BUSINESS.stats.googleRating}`,
    label: `Google Rating (${BUSINESS.stats.totalReviews} reviews)`,
    accent: true,
  },
  {
    icon: CheckCircle,
    value: BUSINESS.stats.customersServed,
    label: "Customers Served",
  },
];

export function TrustBadgesRow() {
  return (
    <SectionWrapper background="white" className="py-12 md:py-16">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
        {badges.map((badge, i) => (
          <AnimateIn key={badge.label} delay={i * 100} variant="up">
            <div className="flex items-center gap-4 rounded-xl border border-zinc-100 bg-zinc-50/50 p-5 hover:border-accent/20 hover:shadow-sm transition-all duration-300">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-800 flex items-center justify-center shadow-sm">
                <badge.icon className="h-5 w-5 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-display text-zinc-900 leading-none">
                  {badge.value}
                  {badge.accent && (
                    <span className="text-amber-500 text-sm ml-0.5">★</span>
                  )}
                </div>
                <div className="text-xs text-zinc-500 mt-1 leading-tight">
                  {badge.label}
                </div>
              </div>
            </div>
          </AnimateIn>
        ))}
      </div>
    </SectionWrapper>
  );
}
