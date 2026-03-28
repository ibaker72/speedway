import { Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/lib/constants";

export function HeroSection() {
  return (
    <section className="relative bg-zinc-950 text-white overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/40 via-zinc-950 to-zinc-950" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-32">
        <div className="max-w-3xl">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 text-sm text-zinc-300">
            <ShieldCheck className="h-4 w-4 text-red-400" />
            <span>Trusted dealer — {BUSINESS.stats.yearsInBusiness}+ years serving Paterson, NJ</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
            Quality Used Cars
            <br />
            <span className="text-zinc-400">in Paterson, NJ</span>
          </h1>

          <p className="mt-5 text-lg sm:text-xl text-zinc-400 max-w-xl leading-relaxed">
            Browse {BUSINESS.stats.vehiclesInStock}+ inspected vehicles with financing for every credit level. Fair prices, honest service, no pressure.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button href="/inventory" variant="primary" size="lg">
              <Search className="h-4.5 w-4.5" />
              Browse Inventory
            </Button>
            <Button href="/finance" variant="outline" size="lg" className="border-zinc-700 text-white hover:bg-zinc-800 hover:text-white">
              Get Pre-Approved
            </Button>
          </div>

          {/* Quick stats */}
          <div className="mt-12 flex flex-wrap gap-x-8 gap-y-4 text-sm text-zinc-500">
            <div>
              <span className="text-2xl font-bold text-white">{BUSINESS.stats.vehiclesInStock}+</span>
              <span className="block mt-0.5">Vehicles in Stock</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-white">{BUSINESS.stats.googleRating}</span>
              <span className="text-yellow-500 ml-0.5">&#9733;</span>
              <span className="block mt-0.5">Google Rating</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-white">{BUSINESS.stats.customersServed}</span>
              <span className="block mt-0.5">Customers Served</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
