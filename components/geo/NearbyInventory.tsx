import Link from "next/link";
import { ArrowRight, Fuel, Gauge, Cog } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { VehicleImage } from "@/components/shared/VehicleImage";
import { Button } from "@/components/ui/button";
import { formatMileage, formatPrice } from "@/lib/data/vehicles-full";
import type { Vehicle } from "@/lib/types/vehicle";

export function NearbyInventory({ title, city, vehicles }: { title: string; city: string; vehicles: Vehicle[] }) {
  if (!vehicles.length) return null;

  return (
    <SectionWrapper background="dark">
      <SectionHeading eyebrow="Inventory" title={title} subtitle="Real in-stock vehicles available now at Speedway Motors." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {vehicles.map((vehicle) => (
          <Link key={vehicle.id} href={`/inventory/${vehicle.slug}`} className="group block rounded-xl border border-white/5 bg-[#101010] hover:border-white/15 transition-colors">
            <div className="relative aspect-16/10 overflow-hidden rounded-t-xl">
              <VehicleImage
                src={vehicle.images[0]?.url}
                alt={`Used ${vehicle.year} ${vehicle.make} ${vehicle.model} near ${city}`}
                make={vehicle.make}
                model={vehicle.model}
                className="w-full h-full group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-4 space-y-2">
              <h3 className="font-semibold text-white">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
              <p className="text-accent-light font-bold text-lg">{formatPrice(vehicle.price)}</p>
              <div className="flex flex-wrap gap-2 text-[11px] text-zinc-400">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/4 px-2 py-1"><Gauge className="h-3 w-3" />{formatMileage(vehicle.mileage)}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/4 px-2 py-1"><Fuel className="h-3 w-3" />{vehicle.fuelType || "Gasoline"}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/4 px-2 py-1"><Cog className="h-3 w-3" />{vehicle.drivetrain || "FWD"}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Button href="/inventory" variant="outline">View Full Inventory <ArrowRight className="h-4 w-4" /></Button>
      </div>
    </SectionWrapper>
  );
}
