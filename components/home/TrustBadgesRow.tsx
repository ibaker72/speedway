import { BadgeCheck, FileCheck2, ShieldCheck, Star, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

const trustSignals = [
  { label: "AAA Approved", icon: BadgeCheck },
  { label: "NAPA Service", icon: Wrench },
  { label: "CARFAX Reports", icon: FileCheck2, href: "https://www.carfax.com" },
  { label: "Google 5-Star", icon: Star },
  { label: "NJ Trusted Dealer", icon: ShieldCheck },
];

export function TrustBadgesRow() {
  return (
    <section className="bg-[#0A0A0A] px-5 py-8 sm:px-6 md:py-9 lg:px-8 border-t border-white/[0.04] border-b border-b-white/[0.04]">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
          {trustSignals.map((signal) => {
            const Icon = signal.icon;
            const chipClass =
              "inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-200 transition-all duration-250 sm:text-[11px] sm:px-[1.125rem]";

            const content = (
              <span className={cn(chipClass, signal.href && "hover:border-white/[0.18] hover:bg-white/[0.04] hover:text-white")}>
                <span className="inline-flex h-[1.125rem] w-[1.125rem] items-center justify-center rounded-full bg-[#D31119]/12 ring-1 ring-inset ring-[#D31119]/35">
                  <Icon className="h-3 w-3 shrink-0 text-[#ff5960]" />
                </span>
                <span className="leading-none whitespace-nowrap">{signal.label}</span>
              </span>
            );

            if (signal.href) {
              return (
                <a key={signal.label} href={signal.href} target="_blank" rel="noopener noreferrer" aria-label={signal.label}>
                  {content}
                </a>
              );
            }

            return <div key={signal.label}>{content}</div>;
          })}
        </div>
      </div>
    </section>
  );
}
