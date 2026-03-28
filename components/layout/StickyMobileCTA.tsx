"use client";

import Link from "next/link";
import { Phone, Search } from "lucide-react";
import { BUSINESS } from "@/lib/constants";

export function StickyMobileCTA() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/[0.06]">
      <div className="flex h-[3.25rem]">
        <a
          href={BUSINESS.phoneHref}
          className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-white active:bg-white/[0.04] transition-colors border-r border-white/[0.06]"
        >
          <Phone className="h-4 w-4 text-accent" />
          Call Now
        </a>
        <Link
          href="/inventory"
          className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-accent active:bg-accent-dark transition-colors"
        >
          <Search className="h-4 w-4" />
          Browse Inventory
        </Link>
      </div>
    </div>
  );
}
