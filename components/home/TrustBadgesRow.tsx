import { MapPin, Star, Car, Users } from "lucide-react";
import { BUSINESS } from "@/lib/constants";

const stats = [
  {
    icon: MapPin,
    value: "Paterson, NJ",
    label: "Easy access from all of Passaic County",
  },
  {
    icon: Star,
    value: `${BUSINESS.stats.googleRating} Stars`,
    label: `${BUSINESS.stats.totalReviews}+ Google Reviews`,
  },
  {
    icon: Car,
    value: `${BUSINESS.stats.vehiclesInStock}+`,
    label: "Vehicles in Stock",
  },
  {
    icon: Users,
    value: BUSINESS.stats.customersServed,
    label: "Happy Customers",
  },
];

export function TrustBadgesRow() {
  return (
    <section className="bg-white py-10 md:py-14 border-b border-zinc-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-red-50 mb-3">
                <stat.icon className="h-5 w-5 text-red-600" />
              </div>
              <div className="text-xl md:text-2xl font-bold text-zinc-900">
                {stat.value}
              </div>
              <div className="text-sm text-zinc-500 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
