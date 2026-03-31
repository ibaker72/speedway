"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Phone, MapPin, ChevronDown, ArrowRight, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { NAV_LINKS, BUSINESS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { createPortal } from "react-dom";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

function MobileMenuContent({ open, onClose }: MobileMenuProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

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

  // Swipe to close
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      if (deltaX > 80) {
        onClose();
      }
    },
    [onClose]
  );

  if (!open) return null;

  return (
    <>
      {/* Backdrop — covers entire viewport above everything */}
      <div
        className="fixed inset-0 z-[998] bg-black/70 backdrop-blur-md lg:hidden"
        style={{ animation: "fadeIn 0.2s ease-out" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu panel — full screen below header area */}
      <div
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="fixed inset-x-0 top-0 bottom-0 z-[999] lg:hidden flex flex-col"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Spacer to push content below the header — matches sticky header height */}
        <div className="flex-shrink-0 h-16" aria-hidden="true" />

        {/* Scrollable menu body */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain bg-[#0a0a0a]/[0.98] border-t border-white/[0.06]"
          style={{ animation: "slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)", WebkitOverflowScrolling: "touch" }}
        >
          {/* Search bar */}
          <div className="px-5 pt-5 pb-2">
            <form action="/inventory" className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                name="search"
                placeholder="Search vehicles..."
                className="input-dark pl-10 py-3 text-sm"
              />
            </form>
          </div>

          <nav className="px-5 py-2">
            {NAV_LINKS.map((link, i) => (
              <div key={link.href + link.label} className="border-b border-white/[0.05] last:border-0">
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
          <div className="px-5 pb-10 space-y-3 border-t border-white/[0.06] pt-6 mt-2">
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
              Paterson, NJ &mdash; Get Directions
            </Link>
          </div>

          {/* Safe area padding for notched phones */}
          <div className="pb-[env(safe-area-inset-bottom)]" />
        </div>
      </div>
    </>
  );
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Portal to document.body so the menu escapes the header's stacking context
  if (!mounted) return null;
  return createPortal(
    <MobileMenuContent open={open} onClose={onClose} />,
    document.body
  );
}
