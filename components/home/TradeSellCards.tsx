import Link from "next/link";
import { AnimateIn } from "@/components/shared/AnimateIn";

export function TradeSellCards() {
  return (
    <section className="py-0">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Trade-in banner */}
        <AnimateIn variant="left">
          <Link
            href="/trade"
            className="relative block group overflow-hidden min-h-[280px] md:min-h-[320px] bg-zinc-900"
          >
            {/* Placeholder for background image —
                Replace with: <Image src="/dealership/trade-in.jpg" alt="" fill className="object-cover" /> */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors duration-300" />
            <div className="relative z-10 flex flex-col justify-center h-full p-8 md:p-12">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Trading in?
              </h3>
              <p className="text-zinc-300 text-base md:text-lg mb-6 max-w-md">
                Find out your car&apos;s trade-in value today. Quick, easy, and no obligation.
              </p>
              <span className="inline-flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-semibold px-6 py-3 rounded-lg transition-colors w-fit">
                Value Your Trade
              </span>
            </div>
          </Link>
        </AnimateIn>

        {/* Finance banner */}
        <AnimateIn variant="right" delay={100}>
          <Link
            href="/finance"
            className="relative block group overflow-hidden min-h-[280px] md:min-h-[320px] bg-zinc-800"
          >
            {/* Placeholder for background image —
                Replace with: <Image src="/dealership/finance.jpg" alt="" fill className="object-cover" /> */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/80 to-zinc-900" />
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors duration-300" />
            <div className="relative z-10 flex flex-col justify-center h-full p-8 md:p-12">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Save time at the dealership
              </h3>
              <p className="text-zinc-300 text-base md:text-lg mb-6 max-w-md">
                Get pre-approved online with our easy credit application. All credit levels welcome.
              </p>
              <span className="inline-flex items-center gap-2 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold px-6 py-3 rounded-lg transition-colors w-fit">
                Get Approved
              </span>
            </div>
          </Link>
        </AnimateIn>
      </div>
    </section>
  );
}
