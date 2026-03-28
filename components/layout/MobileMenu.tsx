"use client";

import Link from "next/link";
import { Phone, MapPin, ChevronRight } from "lucide-react";
import { NAV_LINKS, BUSINESS } from "@/lib/constants";
import { Button } from "@/components/ui/button";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  if (!open) return null;

  return (
    <div className="lg:hidden border-t border-zinc-100 bg-white/98 backdrop-blur-2xl animate-[fadeIn_0.15s_ease-out]">
      <nav className="px-4 py-2">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="flex items-center justify-between px-4 py-3.5 text-[15px] font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 rounded-xl transition-colors"
          >
            {link.label}
            <ChevronRight className="h-4 w-4 text-zinc-300" />
          </Link>
        ))}
      </nav>

      <div className="px-4 pb-6 space-y-3 border-t border-zinc-100 pt-4 mx-4">
        <Button href="/finance" variant="primary" size="lg" className="w-full">
          Get Pre-Approved
        </Button>
        <a
          href={BUSINESS.phoneHref}
          className="flex items-center justify-center gap-2.5 w-full px-6 py-3 text-sm font-semibold text-zinc-900 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors"
        >
          <Phone className="h-4 w-4 text-accent" />
          Call {BUSINESS.phone}
        </a>
        <Link
          href="/contact"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full px-6 py-2.5 text-sm font-medium text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          <MapPin className="h-4 w-4" />
          Locations &amp; Hours
        </Link>
      </div>
    </div>
  );
}
