"use client";

import Link from "next/link";
import { Phone, Car } from "lucide-react";
import { BUSINESS } from "@/lib/constants";

export function StickyMobileCTA() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-zinc-950 border-t border-white/[0.06] shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
      <div className="flex h-[3.5rem]">
        <a
          href={BUSINESS.phoneHref}
          className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-zinc-900 active:bg-zinc-800 transition-colors border-r border-white/[0.06]"
        >
          <Phone className="h-4 w-4 text-accent" />
          Call Now
        </a>
        <Link
          href="/inventory"
          className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-red-700 to-red-600 active:from-red-800 active:to-red-700 transition-colors"
        >
          <Car className="h-4 w-4" />
          Browse {BUSINESS.stats.vehiclesInStock}+ Cars
        </Link>
      </div>
    </div>
  );
}
