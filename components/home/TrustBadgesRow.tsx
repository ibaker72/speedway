import { ShieldCheck, Wrench, BadgeCheck, Star } from "lucide-react";

const badges = [
  { label: "AAA Approved", icon: ShieldCheck },
  { label: "NAPA Service", icon: Wrench },
  { label: "Carfax Reports", icon: BadgeCheck, href: "https://www.carfax.com" },
  { label: "Google 5-Star", icon: Star },
  { label: "NJ Trusted Dealer", icon: ShieldCheck },
];

export function TrustBadgesRow() {
  return (
    <section className="bg-black border-y border-white/[0.07] py-6 md:py-8">
      <div className="mx-auto max-w-[80rem] px-5 sm:px-6 lg:px-8">
        <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {badges.map((badge) => {
            const Icon = badge.icon;
            const content = (
              <>
                <Icon className="h-4 w-4 text-zinc-400" />
                <span className="text-xs uppercase tracking-[0.08em] font-semibold whitespace-nowrap">
                  {badge.label}
                </span>
              </>
            );

            if (badge.href) {
              return (
                <a
                  key={badge.label}
                  href={badge.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-[170px] flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#0f0f0f] text-zinc-300 border border-white/[0.06] grayscale hover:grayscale-0 transition-all"
                >
                  {content}
                </a>
              );
            }

            return (
              <div
                key={badge.label}
                className="min-w-[170px] flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#0f0f0f] text-zinc-300 border border-white/[0.06] grayscale"
              >
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
