import { Shield, Car, Star, CheckCircle } from "lucide-react";
import { BUSINESS } from "@/lib/constants";
import { SectionWrapper } from "@/components/shared/SectionWrapper";

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
  },
  {
    icon: CheckCircle,
    value: BUSINESS.stats.customersServed,
    label: "Customers Served",
  },
];

export function TrustBadgesRow() {
  return (
    <SectionWrapper background="light" className="py-10 md:py-12">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {badges.map((badge) => (
          <div key={badge.label} className="flex items-center gap-3">
            <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-red-700/10 flex items-center justify-center">
              <badge.icon className="h-5 w-5 text-red-700" />
            </div>
            <div>
              <div className="text-xl font-bold text-zinc-900">{badge.value}</div>
              <div className="text-xs text-zinc-500 leading-tight">{badge.label}</div>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
