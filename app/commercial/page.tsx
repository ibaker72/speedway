import Link from "next/link";
import { ArrowRight, Fuel, Gauge, Settings2, Phone } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { VehicleImage } from "@/components/shared/VehicleImage";
import { Button } from "@/components/ui/button";
import { getInventory } from "@/lib/data/inventory-source";
import { formatPrice, formatMileage } from "@/lib/data/vehicles-full";
import { BUSINESS } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commercial Vehicles",
  description:
    "Commercial trucks, vans, and work vehicles available at Speedway Motors in Paterson, NJ. Fleet pricing and commercial financing available.",
};

export default async function CommercialPage() {
  const { vehicles, total } = await getInventory({
    isCommercial: true,
    perPage: 50,
  });

  return (
    <>
      <SectionWrapper background="charcoal" className="py-14 md:py-20">
        <SectionHeading
          title="Commercial Fleet Vehicles"
          subtitle={`${total} work-ready trucks, vans, and fleet vehicles for your business.`}
          as="h1"
        />
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button href={BUSINESS.phoneHref} variant="primary" size="lg">
            <Phone className="h-4 w-4" />
            Call {BUSINESS.phone}
          </Button>
          <Button
            href="/finance"
            variant="outline"
            size="lg"
            className="border-zinc-700 text-white hover:bg-zinc-800 hover:text-white"
          >
            Commercial Financing
          </Button>
        </div>
      </SectionWrapper>

      <SectionWrapper background="white">
        {vehicles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-zinc-500 mb-4">
              No commercial vehicles currently listed. Contact us for
              availability — our inventory changes daily.
            </p>
            <Button href={BUSINESS.phoneHref} variant="primary" size="lg">
              <Phone className="h-4 w-4" />
              Call {BUSINESS.phone}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <Link
                key={vehicle.id}
                href={`/inventory/${vehicle.slug}`}
                className="group rounded-xl border border-zinc-200 bg-white overflow-hidden hover:shadow-lg hover:border-zinc-300 transition-all duration-300"
              >
                <div className="aspect-[16/10] relative overflow-hidden">
                  <VehicleImage
                    src={vehicle.images[0]?.url}
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    make={vehicle.make}
                    model={vehicle.model}
                    className="w-full h-full group-hover:scale-[1.02] transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-zinc-900/80 text-white text-xs font-medium px-2.5 py-1 rounded-md backdrop-blur-sm">
                    Commercial
                  </span>
                </div>

                <div className="p-5">
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
                    <div className="text-lg font-display text-accent flex-shrink-0">
                      {formatPrice(vehicle.price)}
                    </div>
                  </div>

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

                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-700 group-hover:text-red-800 transition-colors">
                    View Details
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
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
