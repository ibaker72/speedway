import Link from "next/link";
import { ArrowRight, Fuel, Gauge, Settings2, Phone, Truck } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { VehicleImage } from "@/components/shared/VehicleImage";
import { AnimateIn } from "@/components/shared/AnimateIn";
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
            className="border-zinc-700 text-white hover:bg-white/5 hover:border-zinc-600 hover:text-white"
          >
            Commercial Financing
          </Button>
        </div>
      </SectionWrapper>

      <SectionWrapper background="white">
        {vehicles.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-lg bg-zinc-100 flex items-center justify-center mb-5">
              <Truck className="h-7 w-7 text-zinc-300" />
            </div>
            <p className="text-lg text-zinc-500 mb-2">
              No commercial vehicles currently listed.
            </p>
            <p className="text-sm text-zinc-400 mb-6">
              Contact us for availability — our inventory changes daily.
            </p>
            <Button href={BUSINESS.phoneHref} variant="primary" size="lg">
              <Phone className="h-4 w-4" />
              Call {BUSINESS.phone}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {vehicles.map((vehicle, i) => (
              <AnimateIn key={vehicle.id} delay={Math.min(i, 8) * 60} variant="up">
                <Link
                  href={`/inventory/${vehicle.slug}`}
                  className="group rounded-lg border border-zinc-200 bg-white overflow-hidden hover:shadow-lg hover:border-zinc-300 transition-all duration-300 block"
                >
                  <div className="aspect-[16/10] relative overflow-hidden bg-zinc-100">
                    <VehicleImage
                      src={vehicle.images[0]?.url}
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      make={vehicle.make}
                      model={vehicle.model}
                      className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-zinc-900 text-white text-xs font-medium px-3 py-1.5 rounded-md">
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
                          <p className="text-sm text-zinc-400 mt-0.5">
                            {vehicle.trim}
                          </p>
                        )}
                      </div>
                      <div className="text-lg font-bold text-red-700 flex-shrink-0">
                        {formatPrice(vehicle.price)}
                      </div>
                    </div>
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
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-red-700 group-hover:text-red-800 transition-colors">
                      View Details
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              </AnimateIn>
            ))}
          </div>
        )}
      </SectionWrapper>
    </>
  );
}
