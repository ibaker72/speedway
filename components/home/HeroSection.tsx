"use client";

import { Search, ShieldCheck, ChevronRight, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/lib/constants";

export function HeroSection() {
  return (
    <section className="relative bg-zinc-950 text-white overflow-hidden min-h-[620px] md:min-h-[700px] lg:min-h-[720px] flex items-center">
      {/* Layered background effects */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />

        {/* Warm golden radial glow — top right */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_15%,_rgba(201,152,26,0.10),_transparent_70%)]" />

        {/* Subtle red accent — bottom left */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_5%_85%,_rgba(155,28,28,0.06),_transparent_60%)]" />

        {/* Secondary golden ambient — center-left */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_30%_50%,_rgba(201,152,26,0.04),_transparent_70%)]" />

        {/* Placeholder for dealership/vehicle background image
            When ready, replace with:
            <Image src="/dealership/hero.jpg" alt="" fill className="object-cover opacity-20" priority />
            and keep the overlays above it */}

        {/* Decorative geometric lines */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.03]">
          <svg className="w-full h-full" viewBox="0 0 600 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="100" y1="0" x2="600" y2="400" stroke="white" strokeWidth="0.5" />
            <line x1="200" y1="0" x2="600" y2="300" stroke="white" strokeWidth="0.5" />
            <line x1="0" y1="200" x2="600" y2="500" stroke="white" strokeWidth="0.5" />
            <line x1="0" y1="400" x2="600" y2="700" stroke="white" strokeWidth="0.5" />
            <line x1="300" y1="0" x2="600" y2="200" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Grain texture */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-32 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div>
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2.5 bg-white/[0.05] backdrop-blur-md border border-white/[0.08] rounded-full px-4 py-2 mb-8 text-sm text-zinc-300">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <span className="font-medium tracking-wide text-xs sm:text-sm">
                Trusted Dealership Since 2005
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.25rem] font-display tracking-tight leading-[1.05]">
              Premium Used Cars
              <br />
              <span className="bg-gradient-to-r from-accent via-accent-light to-accent bg-clip-text text-transparent">
                in Paterson, NJ
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-lg leading-relaxed">
              Browse {BUSINESS.stats.vehiclesInStock}+ quality-inspected vehicles
              with flexible financing for every credit level. Fair prices, honest
              service, zero pressure.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row gap-3.5">
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

            {/* Location hint */}
            <div className="mt-8 flex items-center gap-2 text-sm text-zinc-500">
              <MapPin className="h-3.5 w-3.5 text-accent/60" />
              <span>302-304 22nd Ave, Paterson, NJ 07513</span>
              <span className="text-zinc-700">·</span>
              <span>Mon–Sat 9:30 AM – 7 PM</span>
            </div>
          </div>

          {/* Right: Stats + Trust card */}
          <div className="hidden lg:flex flex-col items-end gap-5">
            {/* Featured stat card */}
            <div className="w-full max-w-sm rounded-2xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Star className="h-5 w-5 text-accent fill-accent" />
                </div>
                <div>
                  <div className="text-2xl font-display text-white leading-none">
                    {BUSINESS.stats.googleRating}
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    Google Rating · {BUSINESS.stats.totalReviews}+ Reviews
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-white/[0.04] border border-white/[0.05] px-4 py-3.5 text-center">
                  <div className="text-2xl font-display text-white leading-none">
                    {BUSINESS.stats.vehiclesInStock}+
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1.5 tracking-wide uppercase">
                    In Stock
                  </div>
                </div>
                <div className="rounded-xl bg-white/[0.04] border border-white/[0.05] px-4 py-3.5 text-center">
                  <div className="text-2xl font-display text-white leading-none">
                    {BUSINESS.stats.customersServed}
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1.5 tracking-wide uppercase">
                    Customers
                  </div>
                </div>
              </div>
            </div>

            {/* Trust bullets */}
            <div className="w-full max-w-sm space-y-3">
              {[
                "Quality inspected before every sale",
                "Financing for all credit levels",
                "Transparent pricing — no hidden fees",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm text-zinc-400"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile stats row */}
        <div className="mt-12 grid grid-cols-3 gap-3 lg:hidden max-w-md">
          {[
            { value: `${BUSINESS.stats.vehiclesInStock}+`, label: "In Stock" },
            { value: String(BUSINESS.stats.googleRating), label: "Google Rating", star: true },
            { value: BUSINESS.stats.customersServed, label: "Customers" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl bg-white/[0.04] border border-white/[0.06] px-3 py-3.5 text-center backdrop-blur-sm"
            >
              <div className="text-xl sm:text-2xl font-display text-white leading-none">
                {stat.value}
                {stat.star && (
                  <span className="text-accent text-sm ml-0.5">&#9733;</span>
                )}
              </div>
              <div className="text-[10px] text-zinc-500 mt-1 tracking-wide uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
