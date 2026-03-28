import { ArrowRight, Fuel, Gauge, Settings2 } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/button";
import { featuredVehicles, formatPrice, formatMileage } from "@/lib/data/vehicles";

export function FeaturedInventory() {
  return (
    <SectionWrapper background="white">
      <SectionHeading
        title="Featured Vehicles"
        subtitle="Hand-picked from our current inventory. Quality inspected and ready to drive."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredVehicles.slice(0, 6).map((vehicle) => (
          <article
            key={vehicle.slug}
            className="group rounded-xl border border-zinc-200 bg-white overflow-hidden hover:shadow-lg hover:border-zinc-300 transition-all duration-200"
          >
            {/* Image placeholder */}
            <div className="aspect-[16/10] bg-zinc-100 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
                <div className="text-center">
                  <div className="text-3xl font-bold">{vehicle.make}</div>
                  <div className="text-sm">{vehicle.model}</div>
                </div>
              </div>
              {/* Body type badge */}
              <span className="absolute top-3 left-3 bg-zinc-900/80 text-white text-xs font-medium px-2.5 py-1 rounded-md capitalize backdrop-blur-sm">
                {vehicle.bodyType}
              </span>
            </div>

            <div className="p-5">
              {/* Title and price */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-semibold text-zinc-900 leading-tight group-hover:text-red-700 transition-colors">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  {vehicle.trim && (
                    <p className="text-sm text-zinc-500 mt-0.5">{vehicle.trim}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-bold text-zinc-900">
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
              <Button
                href={`/inventory/${vehicle.slug}`}
                variant="outline"
                size="sm"
                className="w-full"
              >
                View Details
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </article>
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
