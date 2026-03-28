import Link from "next/link";
import { ArrowRight, Fuel, Gauge, Calendar } from "lucide-react";
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
        title="Handpicked for Quality"
        subtitle="Browse our curated selection of inspected, road-ready vehicles at competitive prices."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {vehicles.map((v, i) => (
          <AnimateIn key={v.id} delay={i * 80} variant="up">
            <Link
              href={`/inventory/${v.slug}`}
              className="card-vehicle group block"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <VehicleImage
                  src={v.images[0]?.url}
                  alt={`${v.year} ${v.make} ${v.model}`}
                  make={v.make}
                  model={v.model}
                  className="w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* Price badge */}
                <div className="absolute bottom-3 left-4">
                  <span className="text-xl font-bold text-white drop-shadow-lg">
                    {formatPrice(v.price)}
                  </span>
                </div>

                {/* Status badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {v.isFeatured && (
                    <span className="badge-accent text-[10px]">Featured</span>
                  )}
                  {v.isNewArrival && (
                    <span className="badge-success text-[10px]">New Arrival</span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-4 pb-5">
                <h3 className="text-base font-semibold text-white group-hover:text-accent-light transition-colors">
                  {v.year} {v.make} {v.model}
                </h3>
                {v.trim && (
                  <p className="text-sm text-zinc-500 mt-0.5">{v.trim}</p>
                )}

                {/* Specs row */}
                <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1.5">
                    <Gauge className="h-3.5 w-3.5" />
                    {formatMileage(v.mileage)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Fuel className="h-3.5 w-3.5" />
                    {v.fuelType || "Gasoline"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {v.year}
                  </span>
                </div>
              </div>
            </Link>
          </AnimateIn>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Button href="/inventory" variant="outline" size="lg">
          View All Inventory
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </SectionWrapper>
  );
}
