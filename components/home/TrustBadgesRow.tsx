import { Shield, Car, Star, CheckCircle } from "lucide-react";
import { BUSINESS } from "@/lib/constants";
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
    label: `Google Rating`,
    sub: `${BUSINESS.stats.totalReviews}+ reviews`,
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
    <section className="bg-white py-10 md:py-14 border-b border-zinc-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {badges.map((badge, i) => (
            <AnimateIn key={badge.label} delay={i * 80} variant="up">
              <div className="flex items-center gap-4 rounded-xl bg-zinc-50/80 border border-zinc-100 p-4 md:p-5 hover:border-accent/20 hover:shadow-sm transition-all duration-300 group">
                <div className="flex-shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-800 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                  <badge.icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-display text-zinc-900 leading-none">
                    {badge.value}
                    {badge.accent && (
                      <span className="text-amber-500 text-sm ml-0.5">★</span>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1 leading-tight">
                    {badge.label}
                  </div>
                  {badge.sub && (
                    <div className="text-[10px] text-zinc-400 leading-tight">
                      {badge.sub}
                    </div>
                  )}
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
