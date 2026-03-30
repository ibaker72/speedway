"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Phone, ChevronDown, MapPin } from "lucide-react";
import { usePathname } from "next/navigation";
import { NAV_LINKS, BUSINESS } from "@/lib/constants";
import type { NavLink } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "./MobileMenu";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { cn } from "@/lib/utils";

function DesktopNavItem({ link, pathname }: { link: NavLink; pathname: string }) {
  const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

  if (!link.children) {
    return (
      <Link
        href={link.href}
        className={cn(
          "px-4 py-2 text-[13px] font-semibold transition-colors duration-200",
          isActive ? "text-accent-light" : "text-zinc-300 hover:text-white"
        )}
      >
        {link.label}
      </Link>
    );
  }

  return (
    <div className="relative group">
      <Link
        href={link.href}
        className={cn(
          "flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold transition-colors duration-200",
          isActive ? "text-accent-light" : "text-zinc-300 hover:text-white"
        )}
      >
        {link.label}
        <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity duration-200" />
      </Link>
      <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="bg-black/85 backdrop-blur-xl border border-white/[0.08] rounded-md shadow-2xl py-2 min-w-[210px]">
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
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 left-0 right-0 z-50 border-b border-white/[0.08] bg-black/70 backdrop-blur-[15px]">
      <div
        className={cn(
          "border-b border-white/[0.06] overflow-hidden transition-all duration-300",
          scrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100"
        )}
      >
        <div className="mx-auto max-w-[80rem] h-9 px-5 sm:px-6 lg:px-8 flex items-center justify-between text-[11px] tracking-wide text-zinc-400">
          <div className="hidden sm:flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-accent" />
            <span>584 22nd Ave, Paterson, NJ</span>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <a href={BUSINESS.phoneHref} className="hover:text-white transition-colors">
              Sales: {BUSINESS.phone}
            </a>
            <span className="text-white/20">|</span>
            <a href="tel:+18622642778" className="hover:text-white transition-colors">
              Service: {BUSINESS.fax}
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[80rem] px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[4.3rem]">
          <Link href="/" className="flex-shrink-0 group" aria-label="Speedway Motors home">
            <BrandLogo
              iconClassName="h-9 w-9 md:h-10 md:w-10"
              textClassName="text-base md:text-lg"
              subtextClassName="text-[8px] md:text-[9px]"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <DesktopNavItem key={link.href + link.label} link={link} pathname={pathname} />
            ))}
          </nav>

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
            <Button href="/finance" variant="primary" size="sm" className="rounded-[2px] uppercase tracking-[0.08em]">
              Get Pre-Approved
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2.5 -mr-2 text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-md transition-colors"
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
