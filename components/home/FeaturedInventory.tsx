import Link from "next/link";
import { ArrowRight, Gauge, Fuel, Cog } from "lucide-react";
import { getInventory } from "@/lib/data/inventory-source";
import { VehicleImage } from "@/components/shared/VehicleImage";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { Button } from "@/components/ui/button";
import { formatPrice, formatMileage, estimateMonthlyPayment } from "@/lib/data/vehicles-full";

export async function FeaturedInventory() {
  const { vehicles: all } = await getInventory({ perPage: 6 });
  const featured = all.filter((v) => v.isFeatured);
  const vehicles = featured.length >= 6 ? featured.slice(0, 6) : all.slice(0, 6);

  if (vehicles.length === 0) return null;

  return (
    <SectionWrapper background="charcoal" id="featured">
      <SectionHeading
        eyebrow="Featured Vehicles"
        title="Premium Inventory"
        subtitle="Hand-picked inventory. Fully inspected, detailed, and ready for the road."
        gradient
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {vehicles.map((v, i) => {
          const estMonthly = v.estimatedPayment || estimateMonthlyPayment(v.price);
          return (
            <AnimateIn key={v.id} delay={i * 80} variant="up">
              <Link
                href={`/inventory/${v.slug}`}
                className="group block rounded-xl border border-white/5 bg-[#101010] transition-all duration-300 hover:-translate-y-[5px] hover:border-white/15 hover:bg-[#1a1a1a] hover:shadow-[0_18px_36px_-14px_rgba(0,0,0,0.75)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-t-xl">
                  <VehicleImage
                    src={v.images[0]?.url}
                    alt={`${v.year} ${v.make} ${v.model}`}
                    make={v.make}
                    model={v.model}
                    className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  {/* Quick View overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex items-center justify-center">
                    <span className="text-sm font-semibold text-white border border-white/30 rounded-lg px-4 py-2 backdrop-blur-sm">
                      Quick View
                    </span>
                  </div>
                  {/* Badges */}
                  {v.isFeatured && (
                    <span className="absolute top-3 left-3 badge-accent text-[10px] shimmer-badge">
                      Featured
                    </span>
                  )}
                  {v.isNewArrival && !v.isFeatured && (
                    <span className="absolute top-3 left-3 badge-success text-[10px] shimmer-badge">
                      New Arrival
                    </span>
                  )}
                </div>

                <div className="p-4 pb-5">
                  <h3 className="text-base font-semibold text-white">
                    {v.year} {v.make} {v.model}
                  </h3>
                  {v.trim && <p className="text-sm text-zinc-500 mt-0.5">{v.trim}</p>}

                  <div className="mt-2">
                    <span className="text-xl font-bold text-accent-light">{formatPrice(v.price)}</span>
                    <span className="block text-xs text-zinc-500 mt-0.5">Est. ${estMonthly}/mo</span>
                  </div>

                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 bg-white/[0.04] border border-white/[0.06] rounded-full px-2.5 py-1">
                      <Gauge className="h-3 w-3" />
                      {formatMileage(v.mileage)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 bg-white/[0.04] border border-white/[0.06] rounded-full px-2.5 py-1">
                      <Fuel className="h-3 w-3" />
                      {v.engine || v.fuelType || "Gas"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 bg-white/[0.04] border border-white/[0.06] rounded-full px-2.5 py-1">
                      <Cog className="h-3 w-3" />
                      {v.drivetrain || "FWD"}
                    </span>
                  </div>
                </div>
              </Link>
            </AnimateIn>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <Button href="/inventory" variant="outline" size="lg" className="uppercase tracking-[0.08em]">
          View All Inventory
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </SectionWrapper>
  );
}
