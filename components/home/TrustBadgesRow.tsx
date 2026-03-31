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
    <section className="bg-[#0A0A0A] px-5 py-6 sm:px-6 sm:py-8 lg:px-8 border-t border-white/[0.04] border-b border-b-white/[0.04]">
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2.5 sm:gap-x-3 sm:gap-y-3 max-w-4xl mx-auto">
        {trustSignals.map((signal) => {
          const Icon = signal.icon;
          const content = (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-white/[0.03] border border-white/[0.06] transition-colors duration-300 hover:border-white/[0.1] hover:bg-white/[0.05]">
              <Icon className="h-3.5 w-3.5 shrink-0 text-zinc-500" strokeWidth={1.8} />
              <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-400 whitespace-nowrap">
                {signal.label}
              </span>
            </span>
          );

          if (signal.href) {
            return (
              <a
                key={signal.label}
                href={signal.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {content}
              </a>
            );
          }

          return (
            <div key={signal.label}>
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
