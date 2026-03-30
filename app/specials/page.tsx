import Link from "next/link";
import { Star, ArrowRight, Gauge, Settings2, Fuel } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { VehicleImage } from "@/components/shared/VehicleImage";
import { Button } from "@/components/ui/button";
import { getInventory } from "@/lib/data/inventory-source";
import { formatPrice, formatMileage } from "@/lib/data/vehicles-full";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Specials & Deals",
  description:
    "Browse featured deals, price drops, and seasonal promotions at Speedway Motors in Paterson, NJ.",
};

export default async function SpecialsPage() {
  const { vehicles: allVehicles } = await getInventory({ perPage: 999 });
  const featured = allVehicles.filter((v) => v.isFeatured);

  return (
    <>
      <PageHero
        eyebrow="Limited Time"
        title="Specials & Deals"
        subtitle="Featured vehicles, price drops, and promotions. Don't miss these opportunities."
      />

      <SectionWrapper background="charcoal">
        {featured.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-zinc-400 mb-4">
              No specials right now — check back soon!
            </p>
            <Button href="/inventory" variant="outline" size="lg">
              Browse Full Inventory
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {featured.map((vehicle) => (
              <Link
                key={vehicle.id}
                href={`/inventory/${vehicle.slug}`}
                className="card-vehicle group block"
              >
                <div className="aspect-[16/10] relative overflow-hidden">
                  <VehicleImage
                    src={vehicle.images[0]?.url}
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    make={vehicle.make}
                    model={vehicle.model}
                    className="w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 badge-accent text-[10px]">
                    <Star className="h-3 w-3" />
                    Featured Deal
                  </span>
                  <div className="absolute bottom-3 right-3">
                    <span className="text-lg font-bold text-white drop-shadow-lg">
                      {formatPrice(vehicle.price)}
                    </span>
                  </div>
                </div>
                <div className="p-4 pb-5">
                  <h3 className="font-semibold text-white leading-tight group-hover:text-accent-light transition-colors">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  {vehicle.trim && (
                    <p className="text-sm text-zinc-500 mt-0.5">{vehicle.trim}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-zinc-500 mt-3 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <Gauge className="h-3.5 w-3.5" />
                      {formatMileage(vehicle.mileage)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Settings2 className="h-3.5 w-3.5" />
                      {vehicle.transmission}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Fuel className="h-3.5 w-3.5" />
                      {vehicle.drivetrain}
                    </span>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent-light group-hover:text-white transition-colors">
                    View Details
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </SectionWrapper>
    </>
  );
}
