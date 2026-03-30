import Link from "next/link";
import { Camera, ArrowRight } from "lucide-react";
import { getInventory } from "@/lib/data/inventory-source";
import { formatPrice } from "@/lib/data/vehicles-full";
import { HeroScrollOverlay } from "./HeroScrollOverlay";
import { HeroVeteranBadge } from "./HeroVeteranBadge";

export async function HeroSection() {
  const { vehicles } = await getInventory({ perPage: 6 });
  const featured = vehicles.find((v) => v.isFeatured) || vehicles[0];

  return (
    <section className="relative overflow-hidden text-white">
      <div className="hero-video-shell relative min-h-[70vh] max-h-[860px] w-full">
        <video
          className="hero-video absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>

        <div className="hero-video-overlay absolute inset-0 bg-[rgba(10,10,10,0.6)]" />
        {/* Stronger left-to-right gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_30%,rgba(255,255,255,0.06),transparent_55%)]" />
        <HeroScrollOverlay />

        <div className="relative z-10 mx-auto flex min-h-[70vh] w-full max-w-[1280px] items-end px-6 pb-20 pt-6 md:px-10 md:pt-8">
          {/* Desktop split layout */}
          <div className="flex w-full flex-col lg:flex-row lg:items-end lg:gap-10">
            {/* Left 60%: headline + CTAs */}
            <div className="lg:w-[60%]">
              <HeroVeteranBadge />

              <h1 className="hero-stagger-2 mt-4 text-4xl font-black leading-[0.95] tracking-[-0.03em] sm:text-5xl md:text-7xl">
                Zero Pressure.
                <br />
                Total Transparency.
                <br />
                Exceptional Vehicles.
              </h1>

              <div className="hero-stagger-3 mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <Link
                  href="/inventory"
                  className="rounded-lg bg-accent px-8 py-4 text-center text-sm font-bold uppercase tracking-[0.08em] text-white transition-all duration-300 hover:bg-accent-light hover:shadow-[0_4px_20px_rgba(211,17,25,0.4)] hover:-translate-y-0.5"
                >
                  Browse Inventory
                </Link>

                <Link
                  href="/finance"
                  className="rounded-lg border border-white/20 bg-white/5 px-8 py-4 text-center text-sm font-bold uppercase tracking-[0.08em] text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:-translate-y-0.5"
                >
                  Get Pre-Approved
                </Link>
              </div>
            </div>

            {/* Right 40%: Featured vehicle card */}
            {featured && (
              <div className="hero-stagger-3 mt-8 lg:mt-0 lg:w-[40%]">
                <Link
                  href={`/inventory/${featured.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-black/50"
                >
                  <div className="aspect-[16/9] relative overflow-hidden bg-gradient-to-br from-surface-2 to-surface-3">
                    {featured.images[0]?.url ? (
                      <img
                        src={featured.images[0].url}
                        alt={`${featured.year} ${featured.make} ${featured.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Camera className="h-10 w-10 text-zinc-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {featured.year} {featured.make} {featured.model}
                        </p>
                        {featured.trim && (
                          <p className="text-xs text-zinc-400">{featured.trim}</p>
                        )}
                      </div>
                      <p className="text-lg font-bold text-accent-light">
                        {formatPrice(featured.price)}
                      </p>
                    </div>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-accent-light group-hover:text-white transition-colors">
                      View Details
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
