"use client";

import { Phone, Car } from "lucide-react";
import { BUSINESS } from "@/lib/constants";

export function StickyMobileCTA() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-zinc-200 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
      <div className="flex h-14">
        <a
          href={BUSINESS.phoneHref}
          className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-zinc-900 active:bg-zinc-800 transition-colors"
        >
          <Phone className="h-4 w-4" />
          Call {BUSINESS.phone}
        </a>
        <a
          href="/inventory"
          className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-red-700 active:bg-red-800 transition-colors"
        >
          <Car className="h-4 w-4" />
          Browse {BUSINESS.stats.vehiclesInStock}+ Cars
        </a>
      </div>
    </div>
  );
}
