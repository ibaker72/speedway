import Link from "next/link";
import { ArrowRight, Fuel, Gauge, Settings2, Star } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { VehicleImage } from "@/components/shared/VehicleImage";
import { Button } from "@/components/ui/button";
import { getInventory } from "@/lib/data/inventory-source";
import { formatPrice, formatMileage } from "@/lib/data/vehicles-full";

export async function FeaturedInventory() {
  // Try to get featured vehicles first, fall back to newest
  const { vehicles: featured } = await getInventory({ perPage: 6 });
  const featuredOnly = featured.filter((v) => v.isFeatured);
  const vehicles =
    featuredOnly.length >= 6 ? featuredOnly.slice(0, 6) : featured.slice(0, 6);

  return (
    <SectionWrapper background="white">
      <SectionHeading
        title="Featured Vehicles"
        subtitle="Hand-picked from our current inventory. Quality inspected and ready to drive."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <Link
            key={vehicle.id}
            href={`/inventory/${vehicle.slug}`}
            className="group rounded-xl border border-zinc-200 bg-white overflow-hidden hover:shadow-lg hover:border-zinc-300 transition-all duration-300"
          >
            {/* Image */}
            <div className="aspect-[16/10] relative overflow-hidden">
              <VehicleImage
                src={vehicle.images[0]?.url}
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                make={vehicle.make}
                model={vehicle.model}
                className="w-full h-full group-hover:scale-[1.02] transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-200/40 to-transparent pointer-events-none" />
              {vehicle.isFeatured && (
                <span className="absolute top-3 left-3 bg-amber-800/90 text-amber-100 text-xs font-medium px-2.5 py-1 rounded-md backdrop-blur-sm flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                  Featured
                </span>
              )}
            </div>

            <div className="p-5">
              {/* Title and price */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-semibold text-zinc-900 leading-tight group-hover:text-red-700 transition-colors">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  {vehicle.trim && (
                    <p className="text-sm text-zinc-500 mt-0.5">
                      {vehicle.trim}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-display text-accent">
                    {formatPrice(vehicle.price)}
                  </div>
                </div>
              </div>

              {/* Specs row */}
              <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
                <span className="flex items-center gap-1">
                  <Gauge className="h-3.5 w-3.5" />
                  {formatMileage(vehicle.mileage)}
                </span>
                <span className="flex items-center gap-1">
                  <Settings2 className="h-3.5 w-3.5" />
                  {vehicle.transmission}
                </span>
                <span className="flex items-center gap-1">
                  <Fuel className="h-3.5 w-3.5" />
                  {vehicle.drivetrain}
                </span>
              </div>

              {/* CTA */}
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-700 group-hover:text-red-800 transition-colors">
                View Details
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Button href="/inventory" variant="secondary" size="lg">
          View All Inventory
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </SectionWrapper>
  );
}
