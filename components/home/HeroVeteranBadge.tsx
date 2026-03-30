"use client";

import { Shield } from "lucide-react";

export function HeroVeteranBadge() {
  return (
    <div className="hero-stagger-1 inline-flex items-center gap-2.5 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 backdrop-blur-sm animate-[pulseGlow_3s_ease-in-out_infinite]">
      <Shield className="h-3.5 w-3.5 text-accent-light" />
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
        Veteran-Owned &amp; Operated in Paterson, NJ
      </span>
    </div>
  );
}
