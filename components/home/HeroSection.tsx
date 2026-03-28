"use client";

import { Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BUSINESS, isOpenNow } from "@/lib/constants";

export function HeroSection() {
  const open = isOpenNow();

  return (
    <section className="relative bg-zinc-950 text-white overflow-hidden">
      {/* Warm golden radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/25 via-zinc-950 to-zinc-950" />

      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-32">
        <div className="max-w-3xl">
          {/* Slogan badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 text-sm text-zinc-300">
            <ShieldCheck className="h-4 w-4 text-amber-400" />
            <span>{BUSINESS.slogan}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display tracking-tight leading-[1.1]">
            Quality Used Cars
            <br />
            <span className="text-zinc-400">in Paterson, NJ</span>
          </h1>

          <p className="mt-5 text-lg sm:text-xl text-zinc-400 max-w-xl leading-relaxed">
            Browse {BUSINESS.stats.vehiclesInStock}+ inspected vehicles with
            financing for every credit level. Fair prices, honest service, no
            pressure.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button href="/inventory" variant="primary" size="lg">
              <Search className="h-4.5 w-4.5" />
              Browse Inventory
            </Button>
            <Button
              href="/finance"
              variant="outline"
              size="lg"
              className="border-zinc-700 text-white hover:bg-zinc-800 hover:text-white"
            >
              Get Pre-Approved
            </Button>
          </div>

          {/* Quick stats */}
          <div className="mt-12 flex flex-wrap gap-x-8 gap-y-4 text-sm text-zinc-500">
            <div>
              <span className="text-2xl font-display text-white">
                {BUSINESS.stats.vehiclesInStock}+
              </span>
              <span className="block mt-0.5">Vehicles in Stock</span>
            </div>
            <div>
              <span className="text-2xl font-display text-white">
                {BUSINESS.stats.googleRating}
              </span>
              <span className="text-amber-400 ml-0.5">&#9733;</span>
              <span className="block mt-0.5">Google Rating</span>
            </div>
            <div>
              <span className="text-2xl font-display text-white">
                {BUSINESS.stats.customersServed}
              </span>
              <span className="block mt-0.5">Customers Served</span>
            </div>
            {open && (
              <div className="flex items-center gap-2 self-center">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                </span>
                <span className="text-green-400 text-sm font-medium">
                  Open Now
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
