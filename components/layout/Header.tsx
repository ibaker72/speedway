"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Phone, ChevronDown } from "lucide-react";
import { NAV_LINKS, BUSINESS } from "@/lib/constants";
import type { NavLink } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "./MobileMenu";

function DesktopNavItem({ link }: { link: NavLink }) {
  if (!link.children) {
    return (
      <Link
        href={link.href}
        className="px-3.5 py-2 text-[13px] font-medium text-zinc-300 hover:text-white rounded-lg transition-colors"
      >
        {link.label}
      </Link>
    );
  }

  return (
    <div className="relative group">
      <Link
        href={link.href}
        className="flex items-center gap-1 px-3.5 py-2 text-[13px] font-medium text-zinc-300 hover:text-white rounded-lg transition-colors"
      >
        {link.label}
        <ChevronDown className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
      </Link>
      <div className="absolute top-full left-0 pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
        <div className="bg-zinc-900 border border-white/10 rounded-lg shadow-xl py-1.5 min-w-[180px]">
          {link.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className="block px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
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

  return (
    <header className="bg-[#0a0a0a] border-b border-white/[0.06] relative z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[4.5rem]">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 flex-shrink-0 group"
          >
            <div className="w-10 h-10 bg-red-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xl leading-none">
                S
              </span>
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
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <DesktopNavItem key={link.href + link.label} link={link} />
            ))}
          </nav>

          {/* Desktop CTA area */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href={BUSINESS.phoneHref}
              className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
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
            className="lg:hidden p-2.5 -mr-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
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
