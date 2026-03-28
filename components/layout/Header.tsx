"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Phone } from "lucide-react";
import { NAV_LINKS, BUSINESS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-[0_1px_20px_rgba(0,0,0,0.06)] border-b border-zinc-200/60"
          : "bg-white/90 backdrop-blur-xl border-b border-zinc-200/40"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[4.5rem]">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 flex-shrink-0 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 ring-1 ring-black/5">
              <span className="text-accent font-black text-xl leading-none font-display">
                S
              </span>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-zinc-900 leading-none block font-display">
                Speedway
              </span>
              <span className="text-[9px] font-semibold tracking-[0.2em] uppercase text-zinc-400 leading-none block mt-0.5">
                Motors LLC
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-3.5 py-2 text-[13px] font-medium text-zinc-600 hover:text-zinc-900 rounded-lg transition-all duration-200 group/nav"
              >
                {link.label}
                <span className="absolute bottom-0.5 left-3.5 right-3.5 h-[2px] bg-accent rounded-full scale-x-0 group-hover/nav:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
            ))}
          </nav>

          {/* Desktop CTA area */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href={BUSINESS.phoneHref}
              className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              <span className="hidden xl:inline">{BUSINESS.phone}</span>
            </a>
            <Button href="/finance" variant="primary" size="sm">
              Get Pre-Approved
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2.5 -mr-2 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
