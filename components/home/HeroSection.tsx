"use client";

import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/lib/constants";

export function HeroSection() {
  return (
    <section className="relative bg-zinc-950 text-white overflow-hidden min-h-[500px] md:min-h-[560px] lg:min-h-[600px] flex items-center">
      {/* Background — placeholder for dealership/vehicle photo */}
      {/* When ready, replace with:
          <Image src="/dealership/hero.jpg" alt="Speedway Motors dealership" fill className="object-cover" priority />
      */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 w-full text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.08]">
          Welcome to Speedway Motors
        </h1>

        <p className="mt-5 text-lg sm:text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed">
          Quality pre-owned cars, trucks, SUVs, and vans in Paterson, NJ.
          {" "}Browse {BUSINESS.stats.vehiclesInStock}+ vehicles with flexible financing for every credit level.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-3.5 justify-center">
          <Button href="/inventory" variant="primary" size="lg">
            Browse Inventory
          </Button>
          <Button
            href="/finance"
            variant="outline"
            size="lg"
            className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 hover:text-white"
          >
            Get Pre-Approved
          </Button>
        </div>
      </div>
    </section>
  );
}
