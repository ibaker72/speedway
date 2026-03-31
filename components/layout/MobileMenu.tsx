"use client";

import { useState, useEffect, useRef, useCallback, type TouchEvent } from "react";
import Link from "next/link";
import { Phone, MapPin, ChevronDown, ArrowRight, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { NAV_LINKS, BUSINESS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);


  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.classList.toggle("mobile-menu-open", open);
    return () => {
      document.body.classList.remove("mobile-menu-open");
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

  // Swipe to close
  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      if (deltaX > 80) onClose();
    },
    [onClose]
  );

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[125] bg-black/75 backdrop-blur-[3px] lg:hidden transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        id="mobile-site-nav"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!open}
        className={cn(
          "fixed inset-x-0 bottom-0 z-[130] lg:hidden bg-[linear-gradient(180deg,#0d0d0f_0%,#090909_100%)] border-t border-white/[0.08] shadow-[0_-18px_45px_rgba(0,0,0,0.72)] overflow-y-auto overscroll-contain transition-transform duration-300 ease-out",
          "pt-[max(calc(env(safe-area-inset-top)+4.1rem),4.1rem)] pb-[max(calc(env(safe-area-inset-bottom)+1rem),1rem)]",
          open ? "translate-y-0" : "pointer-events-none -translate-y-[2%]"
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="px-5 pt-2 pb-2">
          <form action="/inventory" className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input type="text" name="search" placeholder="Search vehicles..." className="input-dark pl-10 py-3 text-sm" />
          </form>
        </div>

        <nav className="px-5 py-2">
          {NAV_LINKS.map((link, i) => (
            <div key={link.href + link.label} className="border-b border-white/[0.06] last:border-0">
              <div className="flex items-center gap-2">
                <Link
                  href={link.href}
                  onClick={onClose}
                  className={cn(
                    "flex-1 py-4 text-[15px] font-semibold tracking-[0.02em] transition-colors",
                    pathname === link.href || pathname.startsWith(`${link.href}/`) ? "text-accent-light" : "text-zinc-100"
                  )}
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
                      className={cn("h-4 w-4 transition-transform duration-300", expandedIndex === i && "rotate-180")}
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

        <div className="px-5 pb-2 space-y-3 border-t border-white/[0.06] pt-6 mt-2">
          <Button href="/finance" variant="primary" size="lg" className="w-full">
            Get Pre-Approved
          </Button>
          <a
            href={BUSINESS.phoneHref}
            className="flex items-center justify-center gap-2.5 w-full px-6 py-3.5 text-sm font-semibold text-white border border-white/[0.12] rounded-xl hover:bg-white/[0.04] transition-colors"
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
            Paterson, NJ &mdash; Get Directions
          </Link>
        </div>
      </div>
    </>
  );
}
