"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, MapPin, ChevronDown } from "lucide-react";
import { NAV_LINKS, BUSINESS } from "@/lib/constants";
import { Button } from "@/components/ui/button";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!open) return null;

  return (
    <div className="lg:hidden border-t border-white/[0.06] bg-[#0a0a0a] animate-[fadeIn_0.15s_ease-out]">
      <nav className="px-4 py-2">
        {NAV_LINKS.map((link, i) => (
          <div key={link.href + link.label}>
            <div className="flex items-center">
              <Link
                href={link.href}
                onClick={onClose}
                className="flex-1 px-4 py-3.5 text-[15px] font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
              {link.children && (
                <button
                  type="button"
                  onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                  className="p-3 text-zinc-500 hover:text-white transition-colors"
                  aria-label={`Expand ${link.label} submenu`}
                >
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      expandedIndex === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
              )}
            </div>
            {link.children && expandedIndex === i && (
              <div className="pl-6 pb-2">
                {link.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={onClose}
                    className="block px-4 py-2.5 text-sm text-zinc-500 hover:text-white transition-colors"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="px-4 pb-6 space-y-3 border-t border-white/[0.06] pt-4 mx-4">
        <Button href="/finance" variant="primary" size="lg" className="w-full">
          Get Pre-Approved
        </Button>
        <a
          href={BUSINESS.phoneHref}
          className="flex items-center justify-center gap-2.5 w-full px-6 py-3 text-sm font-semibold text-white border border-zinc-700 rounded-lg hover:bg-white/5 transition-colors"
        >
          <Phone className="h-4 w-4 text-red-500" />
          Call {BUSINESS.phone}
        </a>
        <Link
          href="/contact"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full px-6 py-2.5 text-sm font-medium text-zinc-500 hover:text-white transition-colors"
        >
          <MapPin className="h-4 w-4" />
          Locations &amp; Hours
        </Link>
      </div>
    </div>
  );
}
