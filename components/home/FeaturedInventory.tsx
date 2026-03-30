import Link from "next/link";
import { ArrowRight, Gauge, Fuel, Cog } from "lucide-react";
import { getInventory } from "@/lib/data/inventory-source";
import { VehicleImage } from "@/components/shared/VehicleImage";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { Button } from "@/components/ui/button";
import { formatPrice, formatMileage } from "@/lib/data/vehicles-full";

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
        subtitle="HAND-PICKED INVENTORY. Fully inspected, detailed, and ready for the road."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {vehicles.map((v, i) => (
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
                <div className="absolute bottom-3 left-4 text-xl font-bold text-white">
                  {formatPrice(v.price)}
                </div>
              </div>

              <div className="p-4 pb-5">
                <h3 className="text-base font-semibold text-white">
                  {v.year} {v.make} {v.model}
                </h3>
                {v.trim && <p className="text-sm text-zinc-500 mt-0.5">{v.trim}</p>}

                <div className="mt-4 rounded-md bg-black/35 px-3 py-2 flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Gauge className="h-3.5 w-3.5" />
                    {formatMileage(v.mileage)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Fuel className="h-3.5 w-3.5" />
                    {v.engine || v.fuelType || "Gas"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Cog className="h-3.5 w-3.5" />
                    {v.drivetrain || "FWD"}
                  </span>
                </div>
              </div>
            </Link>
          </AnimateIn>
        ))}
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
