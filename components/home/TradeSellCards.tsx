import Link from "next/link";
import { ArrowRightLeft, DollarSign, ArrowRight } from "lucide-react";
import { AnimateIn } from "@/components/shared/AnimateIn";

export function TradeSellCards() {
  return (
    <section className="bg-[#0a0a0a]">
      <div className="mx-auto max-w-[80rem] px-5 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {/* Trade-in card */}
          <AnimateIn variant="left">
            <Link
              href="/trade"
              className="group relative block overflow-hidden rounded-2xl min-h-[280px] md:min-h-[340px]"
            >
              {/* Background — replace with: /public/placeholders/dealership/trade-in-placeholder.jpg */}
              <div className="absolute inset-0 bg-gradient-to-br from-surface-3 via-surface-2 to-surface-1" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-500" />

              {/* Subtle accent glow */}
              <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-accent/[0.04] rounded-full blur-[80px]" />

              <div className="relative z-10 flex flex-col justify-end h-full p-8 md:p-10">
                <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mb-5">
                  <ArrowRightLeft className="h-5 w-5 text-accent-light" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Value Your Trade
                </h3>
                <p className="text-zinc-400 text-base mb-6 max-w-sm">
                  Find out your car&apos;s trade-in value today. Quick, easy, and no obligation.
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent-light group-hover:gap-3 transition-all duration-300">
                  Get Your Estimate
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </AnimateIn>

          {/* Finance card */}
          <AnimateIn variant="right" delay={100}>
            <Link
              href="/finance"
              className="group relative block overflow-hidden rounded-2xl min-h-[280px] md:min-h-[340px]"
            >
              {/* Background — replace with: /public/placeholders/dealership/finance-placeholder.jpg */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent-dark/30 via-surface-2 to-surface-1" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-500" />

              {/* Subtle cool glow */}
              <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-500/[0.03] rounded-full blur-[80px]" />

              <div className="relative z-10 flex flex-col justify-end h-full p-8 md:p-10">
                <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mb-5">
                  <DollarSign className="h-5 w-5 text-accent-light" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Get Pre-Approved
                </h3>
                <p className="text-zinc-400 text-base mb-6 max-w-sm">
                  All credit levels welcome. Quick application with competitive rates from trusted NJ lenders.
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent-light group-hover:gap-3 transition-all duration-300">
                  Start Application
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
