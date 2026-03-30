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
    <div className="mt-7 rounded-2xl border border-[#333333] bg-[rgba(26,26,26,0.8)] px-3 py-3 backdrop-blur-md md:px-5 md:py-4">
      <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-wrap md:justify-center md:gap-3">
        {trustSignals.map((signal) => {
          const Icon = signal.icon;
          const item = (
            <>
              <Icon className="h-[15px] w-[15px] shrink-0 text-[#D31119]" />
              <span className="whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.1em] text-white md:text-xs">
                {signal.label}
              </span>
            </>
          );

          const classes =
            "inline-flex min-w-max items-center gap-2 rounded-lg border border-white/8 bg-black/20 px-3 py-2 transition-all duration-300 hover:border-white/20 hover:bg-black/35";

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
  );
}
