import Link from "next/link";
import { ArrowRight, Fuel, Gauge, Settings2 } from "lucide-react";
import { VehicleImage } from "@/components/shared/VehicleImage";
import { formatMileage, formatPrice, estimateMonthlyPayment } from "@/lib/data/vehicles-full";
import { getVehicleTrustBadges } from "@/lib/inventory/trust-badges";
import type { Vehicle } from "@/lib/types/vehicle";

interface VehicleCardProps {
  vehicle: Vehicle;
}

const badgeClassMap: Record<string, string> = {
  "recent-arrival": "bg-emerald-600/90 text-emerald-50 border border-emerald-300/20",
  "price-drop": "bg-accent/90 text-white border border-white/20",
  "low-mileage": "bg-sky-600/85 text-sky-50 border border-sky-300/20",
};

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const estMonthly = vehicle.estimatedPayment || estimateMonthlyPayment(vehicle.price);
  const trustBadges = getVehicleTrustBadges(vehicle).slice(0, 2);

  return (
    <Link href={`/inventory/${vehicle.slug}`} className="card-vehicle group block">
      <div className="aspect-16/10 relative overflow-hidden">
        <VehicleImage
          src={vehicle.images[0]?.url}
          alt={`Used ${vehicle.year} ${vehicle.make} ${vehicle.model} for sale in Paterson NJ — Speedway Motors`}
          make={vehicle.make}
          model={vehicle.model}
          className="w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {vehicle.isFeatured && <span className="badge-accent text-[10px]">Featured</span>}
          {trustBadges.map((badge) => (
            <span key={badge.type} className={`text-[10px] font-semibold px-2 py-1 rounded ${badgeClassMap[badge.type] || "bg-black/70 text-zinc-200 border border-white/10"}`}>
              {badge.label}
            </span>
          ))}
        </div>
      </div>
      <div className="p-4 pb-5">
        <h3 className="font-semibold text-white leading-tight group-hover:text-accent-light transition-colors">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h3>
        {vehicle.trim && <p className="text-sm text-zinc-500 mt-0.5">{vehicle.trim}</p>}

        <div className="mt-3 flex items-start justify-between gap-2">
          <div>
            <span className="text-xl font-bold text-accent-light">{formatPrice(vehicle.price)}</span>
            <span className="block text-xs text-zinc-500 mt-0.5">Est. ${estMonthly}/mo</span>
          </div>
          {vehicle.msrp && vehicle.price < vehicle.msrp && (
            <span className="text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
              Save {formatPrice(vehicle.msrp - vehicle.price)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 bg-white/4 border border-white/6 rounded-full px-2.5 py-1">
            <Gauge className="h-3 w-3" />
            {formatMileage(vehicle.mileage)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 bg-white/4 border border-white/6 rounded-full px-2.5 py-1">
            <Settings2 className="h-3 w-3" />
            {vehicle.transmission}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 bg-white/4 border border-white/6 rounded-full px-2.5 py-1">
            <Fuel className="h-3 w-3" />
            {vehicle.drivetrain}
          </span>
        </div>

        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent-light group-hover:text-white transition-colors">
          View Details
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-200" />
        </span>
      </div>
    </Link>
  );
}
