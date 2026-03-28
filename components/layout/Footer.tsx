import Link from "next/link";
import { Phone, Mail, MapPin, ExternalLink } from "lucide-react";
import { BUSINESS, HOURS } from "@/lib/constants";
import { locations } from "@/lib/data/locations";

const quickLinks = [
  { label: "Browse Inventory", href: "/inventory" },
  { label: "Get Pre-Approved", href: "/finance" },
  { label: "Value Your Trade", href: "/trade" },
  { label: "Sell Your Car", href: "/sell-your-car" },
  { label: "Commercial Vehicles", href: "/commercial" },
];

const aboutLinks = [
  { label: "Customer Reviews", href: "/reviews" },
  { label: "Contact Us", href: "/contact" },
  { label: "FAQ", href: "/faq" },
];

export function Footer() {
  const mainLocation = locations.find((l) => l.type === "showroom")!;

  return (
    <footer className="bg-zinc-950 text-zinc-400 pb-20 lg:pb-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-14 md:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-red-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-lg leading-none">
                  S
                </span>
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-white leading-none block">
                  Speedway
                </span>
                <span className="text-[8px] font-semibold tracking-[0.2em] uppercase text-zinc-500 leading-none block mt-0.5">
                  Motors LLC
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-6 text-zinc-500">
              Trusted used car dealership in Paterson, NJ. Quality inspected
              vehicles, flexible financing, and honest service since 2005.
            </p>
            <div className="space-y-2.5">
              <a
                href={BUSINESS.phoneHref}
                className="flex items-center gap-2.5 text-sm text-zinc-400 hover:text-red-500 transition-colors"
              >
                <Phone className="h-4 w-4 flex-shrink-0" />
                {BUSINESS.phone}
              </a>
              <a
                href={`mailto:${BUSINESS.email}`}
                className="flex items-center gap-2.5 text-sm text-zinc-400 hover:text-red-500 transition-colors"
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
              <a
                href={BUSINESS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-red-500 transition-colors mt-1"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Facebook
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-[11px] font-semibold text-red-500 uppercase tracking-[0.2em] mb-5">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
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

          {/* About links */}
          <div>
            <h3 className="text-[11px] font-semibold text-red-500 uppercase tracking-[0.2em] mb-5">
              Dealership
            </h3>
            <ul className="space-y-2.5">
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

          {/* Hours */}
          <div>
            <h3 className="text-[11px] font-semibold text-red-500 uppercase tracking-[0.2em] mb-5">
              Showroom Hours
            </h3>
            <ul className="space-y-2">
              {HOURS.map((h) => (
                <li key={h.day} className="flex justify-between text-sm">
                  <span className="text-zinc-500">{h.day}</span>
                  <span className={h.open === "Closed" ? "text-zinc-600" : ""}>
                    {h.open === "Closed"
                      ? "Closed"
                      : `${h.open} – ${h.close}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-zinc-800/60 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600">
          <p>
            &copy; {new Date().getFullYear()} {BUSINESS.name}. All rights
            reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link
              href="/faq"
              className="hover:text-zinc-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/faq"
              className="hover:text-zinc-400 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
