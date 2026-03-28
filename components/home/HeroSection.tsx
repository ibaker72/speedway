"use client";

import { Search, ShieldCheck, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/lib/constants";

export function HeroSection() {
  return (
    <section className="relative bg-zinc-950 text-white overflow-hidden min-h-[600px] md:min-h-[680px] flex items-center">
      {/* Layered background effects */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />

        {/* Warm golden radial glow — top right */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_75%_20%,_rgba(201,152,26,0.12),_transparent_70%)]" />

        {/* Red accent glow — bottom left */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_10%_80%,_rgba(185,28,28,0.06),_transparent_60%)]" />

        {/* Car silhouette SVG — decorative background */}
        <svg
          className="absolute right-0 bottom-0 w-[55%] h-auto opacity-[0.03] pointer-events-none select-none"
          viewBox="0 0 800 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 350 C50 350 80 300 140 280 C200 260 260 200 320 180 C380 160 400 140 440 130 C480 120 520 120 560 125 C600 130 640 140 680 170 C720 200 750 250 770 300 C780 330 780 350 780 350 Z"
            fill="white"
          />
          <ellipse cx="220" cy="355" rx="55" ry="55" fill="white" />
          <ellipse cx="220" cy="355" rx="30" ry="30" fill="black" />
          <ellipse cx="630" cy="355" rx="55" ry="55" fill="white" />
          <ellipse cx="630" cy="355" rx="30" ry="30" fill="black" />
        </svg>

        {/* Grain texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Decorative accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-32 w-full">
        <div className="max-w-3xl">
          {/* Slogan badge */}
          <div className="inline-flex items-center gap-2.5 bg-white/[0.06] backdrop-blur-md border border-white/[0.08] rounded-full px-5 py-2 mb-8 text-sm text-zinc-300">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <span className="font-medium tracking-wide">
              {BUSINESS.slogan}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display tracking-tight leading-[1.05]">
            Quality Used Cars
            <br />
            <span className="bg-gradient-to-r from-zinc-400 via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
              in Paterson, NJ
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-xl leading-relaxed">
            Browse {BUSINESS.stats.vehiclesInStock}+ inspected vehicles with
            financing for every credit level. Fair prices, honest service, no
            pressure.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Button href="/inventory" variant="primary" size="lg">
              <Search className="h-4.5 w-4.5" />
              Browse Inventory
              <ChevronRight className="h-4 w-4 -ml-1" />
            </Button>
            <Button
              href="/finance"
              variant="outline"
              size="lg"
              className="border-zinc-700 text-white hover:bg-white/5 hover:border-zinc-600 hover:text-white"
            >
              Get Pre-Approved
            </Button>
          </div>

          {/* Stats row — premium glass cards */}
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-lg">
            {[
              {
                value: `${BUSINESS.stats.vehiclesInStock}+`,
                label: "Vehicles in Stock",
              },
              {
                value: String(BUSINESS.stats.googleRating),
                label: "Google Rating",
                star: true,
              },
              {
                value: BUSINESS.stats.customersServed,
                label: "Customers Served",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-white/[0.04] border border-white/[0.06] px-4 py-4 text-center backdrop-blur-sm"
              >
                <div className="text-2xl sm:text-3xl font-display text-white leading-none">
                  {stat.value}
                  {stat.star && (
                    <span className="text-accent text-lg ml-0.5">&#9733;</span>
                  )}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1.5 tracking-wide uppercase">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
