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
    <section className="bg-[#050505] px-5 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[80rem]">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center lg:justify-center lg:gap-6">
          {trustSignals.map((signal) => {
            const Icon = signal.icon;
            const item = (
              <>
                <Icon className="h-[17px] w-[17px] shrink-0 text-[#D31119]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-200 md:text-xs">
                  {signal.label}
                </span>
              </>
            );

            const classes =
              "inline-flex w-full items-center justify-center gap-2 py-2 text-center lg:w-auto";

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
      </div>
    </section>
  );
}
