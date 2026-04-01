import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { BUSINESS, HOURS } from "@/lib/constants";
import { locations } from "@/lib/data/locations";
import { BrandLogo } from "@/components/shared/BrandLogo";

const quickLinks = [
  { label: "Browse Inventory", href: "/inventory" },
  { label: "Get Pre-Approved", href: "/finance" },
  { label: "Value Your Trade", href: "/trade" },
  { label: "Sell Your Car", href: "/sell-your-car" },
  { label: "Commercial Vehicles", href: "/commercial" },
  { label: "Free Buying Guide", href: "/guides/car-buying-guide" },
  { label: "Value My Car", href: "/value-my-car" },
];

const aboutLinks = [
  { label: "About Us", href: "/about" },
  { label: "Our Team", href: "/team" },
  { label: "Customer Reviews", href: "/reviews" },
  { label: "Contact Us", href: "/contact" },
  { label: "FAQ", href: "/faq" },
  { label: "Blog", href: "/blog" },
];

const resourceLinks = [
  { label: "Payment Calculator", href: "/calculator" },
  { label: "Specials & Deals", href: "/specials" },
  { label: "Warranty & Service", href: "/warranty" },
  { label: "Commercial Vehicles", href: "/commercial" },
  { label: "Inventory Alerts", href: "/alerts" },
];

export function Footer() {
  const mainLocation = locations.find((l) => l.type === "showroom")!;

  return (
    <footer className="bg-[#0A0A0A] text-zinc-400 pb-20 lg:pb-0">
      <div className="section-divider" />

      <div className="mx-auto max-w-[80rem] px-5 sm:px-6 lg:px-8">
        <div className="py-16 md:py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          <div className="lg:col-span-1">
            <div className="mb-5">
              <BrandLogo iconClassName="h-9 w-9" textClassName="text-base" subtextClassName="text-[8px] text-zinc-600" />
            </div>
            <p className="text-sm leading-relaxed mb-6 text-zinc-500">
              Trusted used car dealership in Paterson, NJ. Quality inspected
              vehicles, flexible financing, and honest service since 2005.
            </p>
            <div className="space-y-2.5">
              <a
                href={BUSINESS.phoneHref}
                className="flex items-center gap-2.5 text-sm text-zinc-400 hover:text-accent-light transition-colors"
              >
                <Phone className="h-4 w-4 flex-shrink-0" />
                {BUSINESS.phone}
              </a>
              <a
                href={`mailto:${BUSINESS.email}`}
                className="flex items-center gap-2.5 text-sm text-zinc-400 hover:text-accent-light transition-colors"
              >
                <Mail className="h-4 w-4 flex-shrink-0" />
                {BUSINESS.email}
              </a>
              <div className="flex items-start gap-2.5 text-sm">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>
                  {mainLocation.address}, {mainLocation.city},{" "}
                  {mainLocation.state} {mainLocation.zip}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-5">
              <a
                href={BUSINESS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Speedway Motors on Facebook"
                className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.08] transition-colors"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a
                href={BUSINESS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Speedway Motors on Instagram"
                className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.08] transition-colors"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold text-accent-light uppercase tracking-[0.2em] mb-5">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold text-accent-light uppercase tracking-[0.2em] mb-5">
              Dealership
            </h3>
            <ul className="space-y-3">
              {aboutLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold text-accent-light uppercase tracking-[0.2em] mb-5">
              Resources
            </h3>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold text-accent-light uppercase tracking-[0.2em] mb-5">
              Showroom Hours
            </h3>
            <ul className="space-y-2">
              {HOURS.map((h) => (
                <li key={h.day} className="flex justify-between text-sm">
                  <span className="text-zinc-500">{h.day}</span>
                  <span
                    className={
                      h.open === "Closed" ? "text-zinc-700" : "text-zinc-300"
                    }
                  >
                    {h.open === "Closed"
                      ? "Closed"
                      : `${h.open} – ${h.close}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Service Areas */}
        <div className="border-t border-white/[0.04] py-6">
          <h3 className="text-[11px] font-semibold text-accent-light uppercase tracking-[0.2em] mb-3">
            Service Areas
          </h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            <Link href="/locations" className="text-sm text-zinc-400 hover:text-white transition-colors">All Locations</Link>
            <Link href="/locations/paterson" className="text-sm text-zinc-400 hover:text-white transition-colors">Paterson</Link>
            <Link href="/locations/clifton" className="text-sm text-zinc-400 hover:text-white transition-colors">Clifton</Link>
            <Link href="/locations/passaic" className="text-sm text-zinc-400 hover:text-white transition-colors">Passaic</Link>
            <Link href="/locations/wayne" className="text-sm text-zinc-400 hover:text-white transition-colors">Wayne</Link>
            <Link href="/locations/fair-lawn" className="text-sm text-zinc-400 hover:text-white transition-colors">Fair Lawn</Link>
            <Link href="/locations/totowa" className="text-sm text-zinc-400 hover:text-white transition-colors">Totowa</Link>
          </div>
        </div>

        <div className="border-t border-white/[0.04] py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <p>
            &copy; {new Date().getFullYear()} {BUSINESS.name}. All rights
            reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy-policy"
              className="hover:text-zinc-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="hover:text-zinc-400 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>

        <div className="border-t border-white/[0.03] py-4 text-center">
          <p className="text-[11px] text-zinc-700 tracking-wide">
            Powered by{" "}
            <span className="text-zinc-500 font-medium">Tweak & Build</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
