"use client";

import { BadgeCheck, FileCheck2, ShieldCheck, Star, Wrench } from "lucide-react";

const trustSignals = [
  { label: "AAA Approved", icon: BadgeCheck },
  { label: "NAPA Service", icon: Wrench },
  { label: "CARFAX Reports", icon: FileCheck2, href: "https://www.carfax.com" },
  { label: "Google 5-Star", icon: Star },
  { label: "NJ Trusted Dealer", icon: ShieldCheck },
];

export function TrustBadgesRow() {
  return (
    <section className="border-y border-white/4 bg-[#0A0A0A] px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <div className="relative mx-auto max-w-6xl">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-[#0A0A0A] to-transparent md:hidden" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-[#0A0A0A] to-transparent md:hidden" />

        <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max snap-x snap-mandatory gap-3 pr-4 md:w-full md:flex-wrap md:justify-center md:gap-3">
            {trustSignals.map((signal) => {
              const Icon = signal.icon;

              const content = (
                <div className="inline-flex h-12 min-w-[11.25rem] snap-start shrink-0 items-center justify-center gap-2.5 rounded-2xl border border-white/8 bg-white/3 px-4 text-center backdrop-blur-sm transition-all duration-200 hover:border-white/[0.14] hover:bg-white/5 md:min-w-0">
                  <Icon className="h-[17px] w-[17px] shrink-0 text-[#D31119]" />
                  <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.14em] text-white sm:text-[11.5px] md:text-xs">
                    {signal.label}
                  </span>
                </div>
              );

              if (signal.href) {
                return (
                  <a
                    key={signal.label}
                    href={signal.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D31119]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A] rounded-2xl"
                  >
                    {content}
                  </a>
                );
              }

              return <div key={signal.label}>{content}</div>;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}