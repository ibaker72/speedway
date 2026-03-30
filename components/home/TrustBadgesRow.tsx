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
    <section className="bg-[#0A0A0A] px-5 py-8 sm:px-6 md:py-10 lg:px-8">
      <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
        {trustSignals.map((signal) => {
          const Icon = signal.icon;
          const item = (
            <>
              <Icon className="h-[17px] w-[17px] shrink-0 text-[#D31119]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white md:text-xs">
                {signal.label}
              </span>
            </>
          );

          const classes = "inline-flex items-center justify-center gap-2 text-center";

          if (signal.href) {
            return (
              <a
                key={signal.label}
                href={signal.href}
                target="_blank"
                rel="noopener noreferrer"
                className={classes}
              >
                {item}
              </a>
            );
          }

          return (
            <div key={signal.label} className={classes}>
              {item}
            </div>
          );
        })}
      </div>
    </section>
  );
}
