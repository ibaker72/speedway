import Link from "next/link";
import { ArrowRight, Car, FileText } from "lucide-react";

const cardBase =
  "group relative block overflow-hidden rounded-lg min-h-[280px] md:min-h-[350px]";

export function TradeSellCards() {
  return (
    <section className="bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/trade" className={cardBase}>
            {/* Dark gradient placeholder instead of external image */}
            <div className="absolute inset-0 bg-gradient-to-br from-surface-3 via-surface-2 to-surface-0" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(211,17,25,0.08),transparent_60%)]" />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-500" />
            <div className="absolute top-0 left-0 right-0 h-px bg-accent" />
            <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-10">
              <div className="w-12 h-12 rounded-xl bg-white/6 border border-white/8 flex items-center justify-center mb-5">
                <Car className="h-6 w-6 text-zinc-400" />
              </div>
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-300">Trading In?</p>
              <h3 className="mt-3 text-3xl md:text-4xl font-bold leading-tight">Upgrade Your Drive</h3>
              <p className="mt-4 text-zinc-300 max-w-md">Get a competitive offer and apply it instantly toward your next vehicle.</p>
              <span className="mt-7 inline-flex w-fit items-center gap-2 border border-accent bg-accent px-6 py-3 text-sm uppercase tracking-[0.08em] font-bold rounded-lg transition-all duration-300 group-hover:bg-accent-light group-hover:shadow-[0_4px_20px_rgba(211,17,25,0.4)]">
                Value My Trade <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>

          <Link href="/finance" className={cardBase}>
            {/* Dark gradient placeholder instead of external image */}
            <div className="absolute inset-0 bg-gradient-to-bl from-surface-3 via-surface-2 to-surface-0" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_70%,rgba(255,255,255,0.04),transparent_60%)]" />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-500" />
            <div className="absolute top-0 left-0 right-0 h-px bg-accent" />
            <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-10">
              <div className="w-12 h-12 rounded-xl bg-white/6 border border-white/8 flex items-center justify-center mb-5">
                <FileText className="h-6 w-6 text-zinc-400" />
              </div>
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-300">Save an Hour</p>
              <h3 className="mt-3 text-3xl md:text-4xl font-bold leading-tight">Start Financing Online</h3>
              <p className="mt-4 text-zinc-300 max-w-md">Complete your secure pre-approval before visiting and speed up delivery.</p>
              <span className="mt-7 inline-flex w-fit items-center gap-2 border border-white/60 px-6 py-3 text-sm uppercase tracking-[0.08em] font-bold rounded-lg transition-all duration-300 group-hover:bg-white/10">
                Get Approved <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
