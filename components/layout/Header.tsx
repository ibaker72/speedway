"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Phone, ChevronDown } from "lucide-react";
import { NAV_LINKS, BUSINESS } from "@/lib/constants";
import type { NavLink } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "./MobileMenu";
import { cn } from "@/lib/utils";

function DesktopNavItem({ link }: { link: NavLink }) {
  if (!link.children) {
    return (
      <Link
        href={link.href}
        className="px-4 py-2 text-[13px] font-medium text-zinc-300 hover:text-white transition-colors duration-200"
      >
        {link.label}
      </Link>
    );
  }

  return (
    <div className="relative group">
      <Link
        href={link.href}
        className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-zinc-300 hover:text-white transition-colors duration-200"
      >
        {link.label}
        <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity duration-200" />
      </Link>
      <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="bg-surface-2/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl py-2 min-w-[200px]">
          {link.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className="block px-4 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              {child.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
          : "bg-transparent"
      )}
    >
      {/* Optional: Minimal top utility line — only on desktop, only before scroll */}
      <div
        className={cn(
          "hidden lg:block transition-all duration-300 overflow-hidden border-b border-white/[0.04]",
          scrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100"
        )}
      >
        <div className="mx-auto max-w-[80rem] px-5 sm:px-6 lg:px-8 flex items-center justify-between h-9 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            Paterson, NJ &mdash; Serving Passaic County Since 2005
          </span>
          <div className="flex items-center gap-4">
            <span>Mon–Sat: 9:30 AM – 7:00 PM</span>
            <span className="text-white/[0.08]">|</span>
            <a
              href={BUSINESS.phoneHref}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
            >
              <Phone className="h-3 w-3" />
              {BUSINESS.phone}
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[80rem] px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[4.5rem]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(196,18,48,0.2)] group-hover:shadow-[0_0_24px_rgba(196,18,48,0.35)] transition-shadow duration-300">
              <span className="text-white font-black text-xl leading-none">S</span>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white leading-none block">
                Speedway
              </span>
              <span className="text-[9px] font-semibold tracking-[0.2em] uppercase text-zinc-500 leading-none block mt-0.5">
                Motors LLC
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <DesktopNavItem key={link.href + link.label} link={link} />
            ))}
          </nav>

          {/* Desktop CTA area */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href={BUSINESS.phoneHref}
              className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center">
                <Phone className="h-3.5 w-3.5" />
              </div>
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
            className="lg:hidden p-2.5 -mr-2 text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
