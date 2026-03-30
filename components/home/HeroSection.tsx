"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden text-white">
      <div className="hero-video-shell relative min-h-[70vh] max-h-[860px] w-full">
        <video
          className="hero-video absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>

        <div className="hero-video-overlay absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_30%,rgba(255,255,255,0.06),transparent_55%)]" />

        <div className="relative z-10 mx-auto flex min-h-[70vh] w-full max-w-[1280px] items-end px-6 pb-20 pt-14 md:px-10 md:pt-16">
          <div className="max-w-3xl">
            <p className="hero-stagger-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/70 sm:text-sm">
              DRIVEN BY DISCIPLINE, INTEGRITY, AND SERVICE
            </p>

            <h1 className="hero-stagger-2 mt-4 text-4xl font-black uppercase leading-[0.95] tracking-[-0.03em] sm:text-5xl md:text-7xl">
              Drive Better.
              <br />
              Pay Less.
            </h1>

            <div className="hero-stagger-3 mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link
                href="/inventory"
                className="rounded-lg bg-accent px-8 py-4 text-center text-sm font-bold uppercase tracking-[0.08em] text-white transition-all duration-300 hover:bg-accent-light hover:shadow-[0_4px_20px_rgba(211,17,25,0.4)] hover:-translate-y-0.5"
              >
                Browse Inventory
              </Link>

              <Link
                href="/finance"
                className="rounded-lg border border-white/20 bg-white/5 px-8 py-4 text-center text-sm font-bold uppercase tracking-[0.08em] text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:-translate-y-0.5"
              >
                Get Pre-Approved
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-white/40" />
        </div>
      </div>
    </section>
  );
}
