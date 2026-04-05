"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Phone, ChevronDown, MapPin } from "lucide-react";
import { usePathname } from "next/navigation";
import { NAV_LINKS, BUSINESS } from "@/lib/constants";
import type { NavLink } from "@/lib/constants";
import { dealerConfig } from "@/dealer.config";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { cn } from "@/lib/utils";

function isLinkActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function DesktopNavItem({ link, pathname }: { link: NavLink; pathname: string }) {
  const isActive = isLinkActive(pathname, link.href);

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
        <ChevronDown className="h-3 w-3 opacity-50 transition-opacity duration-200 group-hover:opacity-100" />
      </Link>

      <div className="absolute left-0 top-full z-160 invisible pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
        <div className="min-w-[210px] rounded-md border border-white/8 bg-black/85 py-2 shadow-2xl backdrop-blur-xl">
          {link.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className="block px-4 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-white/4 hover:text-white"
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
  const [mobileOpenPath, setMobileOpenPath] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const mobileOpen = mobileOpenPath === pathname;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpenPath(null);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const mobilePanelTop = scrolled ? 64 : 104;

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-[120] isolate overflow-visible border-b border-white/8 bg-black/70 backdrop-blur-[15px]">
        <div
          className={cn(
            "overflow-hidden border-b border-white/6 transition-all duration-300",
            scrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100"
          )}
        >
          <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-5 text-[11px] tracking-wide text-zinc-400 sm:px-6 lg:px-8">
            <div className="hidden items-center gap-1.5 sm:flex">
              <MapPin className="h-3 w-3 text-accent" />
              <span>302-304 22nd Ave, Paterson, NJ</span>
            </div>

            <div className="ml-auto flex items-center gap-4">
              <a href={BUSINESS.phoneHref} className="transition-colors hover:text-white">
                Sales: {BUSINESS.phone}
              </a>
              <span className="text-white/20">|</span>
              <a href="tel:+18622642778" className="transition-colors hover:text-white">
                Service: {BUSINESS.fax}
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-[4.3rem]">
            <Link href="/" className="group shrink-0" aria-label="Speedway Motors home">
              <BrandLogo
                iconClassName="h-9 w-9 md:h-10 md:w-10"
                textClassName="text-base md:text-lg"
                subtextClassName="text-[8px] md:text-[9px]"
              />
            </Link>

            <nav className="hidden items-center gap-1 lg:flex">
              {NAV_LINKS.filter((link) => {
                if (link.href === "/blog" && !dealerConfig.features.blog) return false;
                return true;
              }).map((link) => (
                <DesktopNavItem key={link.href + link.label} link={link} pathname={pathname} />
              ))}
            </nav>

            <div className="hidden items-center gap-4 lg:flex">
              <a
                href={BUSINESS.phoneHref}
                className="flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/6">
                  <Phone className="h-3.5 w-3.5" />
                </div>
                <span className="hidden xl:inline">{BUSINESS.phone}</span>
              </a>

              <Button href="/finance" variant="primary" size="sm" className="uppercase tracking-[0.08em]">
                Get Pre-Approved
              </Button>
            </div>

            <button
              type="button"
              onClick={() => setMobileOpenPath((prev) => (prev === pathname ? null : pathname))}
              className="rounded-md p-2.5 text-zinc-400 transition-colors hover:bg-white/6 hover:text-white lg:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label="Close mobile menu overlay"
            className="fixed inset-0 z-[130] bg-black/72 lg:hidden"
            onClick={() => setMobileOpenPath(null)}
          />

          <div
            className="fixed inset-x-4 z-[140] lg:hidden"
            style={{
              top: mobilePanelTop,
              maxHeight: `calc(100dvh - ${mobilePanelTop + 16}px)`,
            }}
          >
            <div className="overflow-hidden rounded-2xl border border-white/8 bg-neutral-950/95 shadow-[0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
              <nav className="max-h-full overflow-y-auto p-3">
                <div className="space-y-1">
                  {NAV_LINKS.filter((link) => {
                    if (link.href === "/blog" && !dealerConfig.features.blog) return false;
                    return true;
                  }).map((link) => {
                    const parentActive = isLinkActive(pathname, link.href);

                    if (!link.children?.length) {
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={cn(
                            "block rounded-xl px-4 py-3 text-[15px] font-semibold transition-colors",
                            parentActive
                              ? "bg-white/6 text-white"
                              : "text-zinc-300 hover:bg-white/4 hover:text-white"
                          )}
                        >
                          {link.label}
                        </Link>
                      );
                    }

                    return (
                      <div key={link.href} className="rounded-xl border border-white/6 bg-white/2">
                        <Link
                          href={link.href}
                          className={cn(
                            "flex items-center justify-between px-4 py-3 text-[15px] font-semibold transition-colors",
                            parentActive ? "text-white" : "text-zinc-200 hover:text-white"
                          )}
                        >
                          <span>{link.label}</span>
                          <ChevronDown className="h-4 w-4 opacity-60" />
                        </Link>

                        <div className="border-t border-white/6 px-2 py-2">
                          {link.children.map((child) => {
                            const childActive = isLinkActive(pathname, child.href);

                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={cn(
                                  "block rounded-lg px-3 py-2.5 text-sm transition-colors",
                                  childActive
                                    ? "bg-white/6 text-white"
                                    : "text-zinc-400 hover:bg-white/4 hover:text-white"
                                )}
                              >
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 space-y-3 border-t border-white/8 pt-4">
                  <a
                    href={BUSINESS.phoneHref}
                    className="flex items-center gap-3 rounded-xl border border-white/8 px-4 py-3 text-zinc-200 transition-colors hover:bg-white/4 hover:text-white"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/6">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">Call Sales</span>
                      <span className="text-sm font-semibold">{BUSINESS.phone}</span>
                    </div>
                  </a>

                  <Button
                    href="/finance"
                    variant="primary"
                    size="sm"
                    className="w-full uppercase tracking-[0.08em]"
                  >
                    Get Pre-Approved
                  </Button>
                </div>
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
}