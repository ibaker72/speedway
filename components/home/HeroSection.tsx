"use client";

import { useEffect, useState } from "react";
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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <section className="relative min-h-[100svh] flex items-center text-white overflow-hidden">
      {/* ── Background Media ── */}
      {/* Replace with dealership video: /public/placeholders/hero/hero-lot-placeholder.mp4 */}
      {/* Poster fallback: /public/placeholders/hero/hero-lot-poster.jpg */}
      {/*
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/placeholders/hero/hero-lot-poster.jpg"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/placeholders/hero/hero-lot-placeholder.mp4" type="video/mp4" />
        </video>
      */}

      {/* Placeholder background — cinematic dark gradient with subtle automotive feel */}
      <div className="absolute inset-0">
        {/* Deep base */}
        <div className="absolute inset-0 bg-[#050505]" />

        {/* Atmospheric gradient — warm dark automotive feel */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c0808] via-[#0a0a0a] to-[#080a0c]" />

        {/* Subtle red ambient glow — top left */}
        <div className="absolute -top-1/4 -left-1/4 w-[80%] h-[80%] bg-accent/[0.03] rounded-full blur-[120px]" />

        {/* Cool metallic ambient glow — bottom right */}
        <div className="absolute -bottom-1/4 -right-1/4 w-[60%] h-[60%] bg-blue-500/[0.015] rounded-full blur-[100px]" />

        {/* Subtle grid texture for depth */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      {/* ── Overlays ── */}
      {/* Dark directional overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#050505] to-transparent" />
      {/* Vignette */}
      <div className="absolute inset-0 overlay-vignette" />

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto max-w-[80rem] px-5 sm:px-6 lg:px-8 w-full pt-32 pb-20 md:pt-40 md:pb-28 lg:pt-44 lg:pb-32">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div
            className={`transition-all duration-700 delay-200 ${
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <span className="badge-accent">
              Paterson, NJ&apos;s Trusted Pre-Owned Dealership
            </span>
          </div>

          {/* Headline */}
          <h1
            className={`mt-6 text-5xl sm:text-6xl lg:text-7xl xl:text-[5.25rem] font-bold tracking-tight leading-[1.05] transition-all duration-700 delay-[400ms] ${
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            Drive Home{" "}
            <br className="hidden sm:block" />
            With <span className="text-accent-light">Confidence</span>
          </h1>

          {/* Subheadline */}
          <p
            className={`mt-6 text-lg sm:text-xl text-zinc-400 max-w-xl leading-relaxed transition-all duration-700 delay-[600ms] ${
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            Explore quality pre-owned cars, trucks, SUVs, and vans with flexible
            financing options for every credit situation.
          </p>

          {/* CTAs */}
          <div
            className={`mt-10 flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-[800ms] ${
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <Button href="/inventory" variant="premium" size="lg">
              Browse Inventory
            </Button>
            <Button href="/finance" variant="glass" size="lg">
              Get Pre-Approved
            </Button>
          </div>

          {/* Trust items */}
          <div
            className={`mt-14 flex flex-wrap gap-x-6 gap-y-3 transition-all duration-700 delay-[1000ms] ${
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
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
