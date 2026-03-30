"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Phone, MapPin, ChevronDown, ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { NAV_LINKS, BUSINESS } from "@/lib/constants";
import { Button } from "@/components/ui/button";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Focus trap
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open || !menuRef.current) return;
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = menuRef.current.querySelectorAll<HTMLElement>(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [open, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />

      {/* Menu panel */}
      <div
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="fixed top-[64px] left-0 right-0 bottom-0 z-50 lg:hidden bg-[#0a0a0a] overflow-y-auto animate-[slideDown_0.3s_cubic-bezier(0.16,1,0.3,1)]"
      >
        <nav className="px-5 py-4">
          {NAV_LINKS.map((link, i) => (
            <div key={link.href + link.label} className="border-b border-white/[0.04] last:border-0">
              <div className="flex items-center">
                <Link
                  href={link.href}
                  onClick={onClose}
                  className={`flex-1 py-4 text-base font-medium transition-colors ${pathname === link.href || pathname.startsWith(`${link.href}/`) ? "text-accent-light" : "text-white"}`}
                >
                  {link.label}
                </Link>
                {link.children && (
                  <button
                    type="button"
                    onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                    className="p-3 text-zinc-500 hover:text-white transition-colors"
                    aria-label={`Expand ${link.label} submenu`}
                    aria-expanded={expandedIndex === i}
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-300 ${
                        expandedIndex === i ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                )}
              </div>
              {link.children && expandedIndex === i && (
                <div className="pl-4 pb-3 space-y-1 animate-[fadeIn_0.2s_ease-out]">
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={onClose}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.04] transition-colors"
                    >
                      <ArrowRight className="h-3 w-3 text-accent" />
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-5 pb-8 space-y-3 border-t border-white/[0.06] pt-6 mt-2">
          <Button href="/finance" variant="primary" size="lg" className="w-full">
            Get Pre-Approved
          </Button>
          <a
            href={BUSINESS.phoneHref}
            className="flex items-center justify-center gap-2.5 w-full px-6 py-3.5 text-sm font-semibold text-white border border-white/[0.1] rounded-xl hover:bg-white/[0.04] transition-colors"
          >
            <Phone className="h-4 w-4 text-accent" />
            Call {BUSINESS.phone}
          </a>
          <Link
            href="/contact"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-3 text-sm font-medium text-zinc-500 hover:text-white transition-colors"
          >
            <MapPin className="h-4 w-4" />
            Paterson, NJ &mdash; Visit Us
          </Link>
        </div>
      </div>
    </>
  );
}
