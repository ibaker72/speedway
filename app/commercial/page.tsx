import Link from "next/link";
import { ArrowRight, Fuel, Gauge, Settings2, Phone, Truck } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { VehicleImage } from "@/components/shared/VehicleImage";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { Button } from "@/components/ui/button";
import { getInventory } from "@/lib/data/inventory-source";
import { formatPrice, formatMileage } from "@/lib/data/vehicles-full";
import { BUSINESS } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commercial Vehicles for Sale in Paterson, NJ",
  description:
    "Commercial trucks, vans, and work vehicles at Speedway Motors in Paterson, NJ. Fleet pricing, commercial financing, and a wide selection of work-ready vehicles.",
  alternates: {
    canonical: "https://www.speedwaymotorsllc.com/commercial",
  },
};

export default async function CommercialPage() {
  const { vehicles, total } = await getInventory({
    isCommercial: true,
    perPage: 50,
  });

  return (
    <>
      <PageHero
        eyebrow="Commercial Fleet"
        title="Commercial Vehicles in Paterson, NJ"
        subtitle={`${total} work-ready trucks, vans, and fleet vehicles for your business.`}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <Button href={BUSINESS.phoneHref} variant="primary" size="lg">
            <Phone className="h-4 w-4" />
            Call {BUSINESS.phone}
          </Button>
          <Button href="/finance" variant="outline" size="lg">
            Commercial Financing
          </Button>
        </div>
      </PageHero>

      <SectionWrapper background="charcoal">
        {vehicles.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5">
              <Truck className="h-7 w-7 text-zinc-600" />
            </div>
            <p className="text-lg text-zinc-400 mb-2">
              No commercial vehicles currently listed.
            </p>
            <p className="text-sm text-zinc-500 mb-6">
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
              <AnimateIn
                key={vehicle.id}
                delay={Math.min(i, 8) * 60}
                variant="up"
              >
                <Link
                  href={`/inventory/${vehicle.slug}`}
                  className="card-vehicle group block"
                >
                  <div className="aspect-[16/10] relative overflow-hidden">
                    <VehicleImage
                      src={vehicle.images[0]?.url}
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      make={vehicle.make}
                      model={vehicle.model}
                      className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 badge-premium text-[10px]">
                      Commercial
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-semibold text-white leading-tight group-hover:text-accent-light transition-colors">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </h3>
                        {vehicle.trim && (
                          <p className="text-sm text-zinc-500 mt-0.5">
                            {vehicle.trim}
                          </p>
                        )}
                      </div>
                      <div className="text-lg font-bold text-accent-light flex-shrink-0">
                        {formatPrice(vehicle.price)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-500 mb-4 flex-wrap">
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
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent-light group-hover:text-white transition-colors">
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
