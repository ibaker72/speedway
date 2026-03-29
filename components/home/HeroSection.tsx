"use client";

import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/lib/constants";
import { Shield, Star, Car, CreditCard } from "lucide-react";

const trustItems = [
  { icon: Car, label: `${BUSINESS.stats.vehiclesInStock}+ Vehicles` },
  { icon: Star, label: `${BUSINESS.stats.googleRating}★ Rating` },
  { icon: CreditCard, label: "Flexible Financing" },
  { icon: Shield, label: "Quality Inspected" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-[100svh] flex items-center text-white overflow-hidden">
      {/* ── Background Media ── */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
      >
        {/* Add your licensed cinematic b-roll at /public/videos/luxury-hero.mp4 */}
        <source src="/videos/luxury-hero.mp4" type="video/mp4" />
      </video>
      {/* ── Overlays ── */}
      {/* Dark directional overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black/75" />
      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#000000] to-transparent" />
      {/* Vignette */}
      <div className="absolute inset-0 overlay-vignette" />

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto max-w-[80rem] px-5 sm:px-6 lg:px-8 w-full pt-32 pb-20 md:pt-40 md:pb-28 lg:pt-44 lg:pb-32">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div className="animate-fade-in">
            <span className="badge-accent">
              Paterson, NJ&apos;s Trusted Pre-Owned Dealership
            </span>
          </div>

          {/* Headline */}
          <h1 className="heading-luxe mt-6 text-5xl sm:text-6xl lg:text-7xl xl:text-[5.25rem] font-bold leading-[1.05] animate-fade-up">
            Drive Home{" "}
            <br className="hidden sm:block" />
            With <span className="text-accent-light">Confidence</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-xl leading-relaxed animate-fade-up [animation-delay:120ms]">
            Explore quality pre-owned cars, trucks, SUVs, and vans with flexible
            financing options for every credit situation.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-fade-up [animation-delay:220ms]">
            <Button href="/inventory" variant="premium" size="lg">
              Browse Inventory
            </Button>
            <Button href="/finance" variant="glass" size="lg">
              Get Pre-Approved
            </Button>
          </div>

          {/* Trust items */}
          <div className="mt-14 flex flex-wrap gap-x-6 gap-y-3 animate-fade-up [animation-delay:320ms]">
            {trustItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-2.5 text-sm text-zinc-500"
                >
                  <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                    <Icon className="h-3.5 w-3.5 text-zinc-400" />
                  </div>
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2 text-zinc-600">
        <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-zinc-600 to-transparent" />
      </div>
    </section>
  );
}
