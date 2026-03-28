import Link from "next/link";
import { ArrowRight, Fuel, Gauge, Settings2, Star } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { VehicleImage } from "@/components/shared/VehicleImage";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { Button } from "@/components/ui/button";
import { getInventory } from "@/lib/data/inventory-source";
import { formatPrice, formatMileage } from "@/lib/data/vehicles-full";

export async function FeaturedInventory() {
  const { vehicles: featured } = await getInventory({ perPage: 6 });
  const featuredOnly = featured.filter((v) => v.isFeatured);
  const vehicles =
    featuredOnly.length >= 6 ? featuredOnly.slice(0, 6) : featured.slice(0, 6);

  if (vehicles.length === 0) {
    return (
      <SectionWrapper background="white">
        <SectionHeading
          title="Featured Vehicles"
          subtitle="Hand-selected from our current inventory. Quality inspected and ready to drive."
        />
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-zinc-100 flex items-center justify-center mb-5">
            <Star className="h-8 w-8 text-zinc-300" />
          </div>
          <p className="text-zinc-500 mb-6">
            New inventory arriving daily. Check back soon for featured vehicles.
          </p>
          <Button href="/inventory" variant="secondary" size="md">
            View All Inventory
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper background="white">
      <SectionHeading
        title="Featured Vehicles"
        subtitle="Hand-selected from our current inventory. Quality inspected and ready to drive."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {vehicles.map((vehicle, i) => (
          <AnimateIn key={vehicle.id} delay={i * 80} variant="up">
            <Link
              href={`/inventory/${vehicle.slug}`}
              className="group rounded-2xl border border-zinc-200/80 bg-white overflow-hidden hover:shadow-xl hover:shadow-zinc-200/40 hover:border-zinc-300 transition-all duration-500 block"
            >
              {/* Image */}
              <div className="aspect-[16/10] relative overflow-hidden bg-zinc-100">
                <VehicleImage
                  src={vehicle.images[0]?.url}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  make={vehicle.make}
                  model={vehicle.model}
                  className="w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                {vehicle.isFeatured && (
                  <span className="absolute top-3 left-3 bg-zinc-900/80 text-accent text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-md flex items-center gap-1.5 border border-white/10">
                    <Star className="h-3 w-3 fill-accent text-accent" />
                    Featured
                  </span>
                )}
                {/* Price overlay */}
                <div className="absolute bottom-3 right-3 bg-zinc-900/85 backdrop-blur-md rounded-lg px-3.5 py-2 border border-white/10">
                  <span className="text-lg font-display text-accent">
                    {formatPrice(vehicle.price)}
                  </span>
                </div>
              </div>

              <div className="p-5">
                {/* Title */}
                <div className="mb-3">
                  <h3 className="font-semibold text-zinc-900 leading-tight group-hover:text-red-700 transition-colors text-base">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  {vehicle.trim && (
                    <p className="text-sm text-zinc-400 mt-0.5">{vehicle.trim}</p>
                  )}
                </div>

                {/* Specs row */}
                <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4 flex-wrap">
                  <span className="flex items-center gap-1 bg-zinc-50 rounded-md px-2 py-1">
                    <Gauge className="h-3 w-3 text-zinc-400" />
                    {formatMileage(vehicle.mileage)}
                  </span>
                  <span className="flex items-center gap-1 bg-zinc-50 rounded-md px-2 py-1">
                    <Settings2 className="h-3 w-3 text-zinc-400" />
                    {vehicle.transmission}
                  </span>
                  <span className="flex items-center gap-1 bg-zinc-50 rounded-md px-2 py-1">
                    <Fuel className="h-3 w-3 text-zinc-400" />
                    {vehicle.drivetrain}
                  </span>
                </div>

                {/* CTA */}
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-red-700 group-hover:text-red-800 transition-colors">
                  View Details
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1.5 transition-transform duration-300" />
                </span>
              </div>
            </Link>
          </AnimateIn>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Button href="/inventory" variant="secondary" size="lg">
          View All Inventory
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </SectionWrapper>
  );
}
