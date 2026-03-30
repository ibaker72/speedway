import { BadgeCheck, FileCheck2, ShieldCheck, Star, Wrench } from "lucide-react";

const trustSignals = [
  { label: "AAA Approved", icon: BadgeCheck },
  { label: "NAPA Service", icon: Wrench },
  { label: "Carfax Reports", icon: FileCheck2, href: "https://www.carfax.com" },
  { label: "Google 5-Star", icon: Star },
  { label: "NJ Trusted Dealer", icon: ShieldCheck },
];

export function TrustBadgesRow() {
  return (
    <section className="bg-[#0A0A0A] px-5 py-8 sm:px-6 md:py-10 lg:px-8 border-t border-white/[0.04] border-b border-b-white/[0.04]">
      <div className="grid grid-cols-3 gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-3 sm:gap-y-3 max-w-4xl mx-auto">
        {trustSignals.map((signal, i) => {
          const Icon = signal.icon;
          const content = (
            <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
              <Icon className="h-[17px] w-[17px] shrink-0 text-[#D31119]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white md:text-xs whitespace-nowrap">
                {signal.label}
              </span>
            </div>
          );

          // On mobile: first row has 3, second row has 2 centered
          const mobileClass = i >= 3 ? "col-span-3 sm:col-span-1 flex justify-center" : "";

          if (signal.href) {
            return (
              <a
                key={signal.label}
                href={signal.href}
                target="_blank"
                rel="noopener noreferrer"
                className={mobileClass}
              >
                {content}
              </a>
            );
          }

          return (
            <div key={signal.label} className={mobileClass}>
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
