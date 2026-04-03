"use client";

import { MapPin } from "lucide-react";

export function HeroLocationBadge() {
  return (
    <div className="hero-stagger-1 inline-flex items-center gap-2.5 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 backdrop-blur-sm animate-pulse-glow">
      <MapPin className="h-3.5 w-3.5 text-accent-light" />
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
        Serving Paterson Since 2005
      </span>
    </div>
  );
}