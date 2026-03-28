"use client";

import { MapPin, Star, Car, Users } from "lucide-react";
import { BUSINESS } from "@/lib/constants";
import { AnimateIn } from "@/components/shared/AnimateIn";

const stats = [
  {
    icon: MapPin,
    value: "Paterson, NJ",
    label: "Serving the community since 2005",
  },
  {
    icon: Star,
    value: `${BUSINESS.stats.googleRating}★`,
    label: `${BUSINESS.stats.totalReviews}+ Google Reviews`,
  },
  {
    icon: Car,
    value: `${BUSINESS.stats.vehiclesInStock}+`,
    label: "Vehicles in stock",
  },
  {
    icon: Users,
    value: BUSINESS.stats.customersServed,
    label: "Customers served",
  },
];

export function TrustBadgesRow() {
  return (
    <section className="relative bg-[#0a0a0a] py-14 md:py-16">
      <div className="section-divider absolute top-0 left-0 right-0" />

      <div className="mx-auto max-w-[80rem] px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <AnimateIn key={stat.label} delay={i * 100} variant="up">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-accent-light" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-zinc-500 mt-0.5">{stat.label}</p>
                  </div>
                </div>
              </AnimateIn>
            );
          })}
        </div>
      </div>

      <div className="section-divider absolute bottom-0 left-0 right-0" />
    </section>
  );
}
