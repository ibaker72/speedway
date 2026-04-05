import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { getInventory } from "@/lib/data/inventory-source";
import { VehicleImage } from "@/components/shared/VehicleImage";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/button";
import { formatPrice, formatMileage } from "@/lib/data/vehicles-full";

export async function NewArrivals() {
  const { vehicles: all } = await getInventory({ perPage: 20, sortBy: "date-added" });
  const newArrivals = all.filter((v) => v.isNewArrival).slice(0, 8);

  if (newArrivals.length === 0) return null;

  return (
    <SectionWrapper background="dark">
      <SectionHeading
        eyebrow="Just Arrived"
        title="Fresh on the Lot"
        subtitle="The newest additions to our inventory. These won't last long."
      />

      <div className="overflow-x-auto pb-4 -mx-5 px-5 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-5 snap-x snap-mandatory" style={{ minWidth: "min-content" }}>
          {newArrivals.map((v) => (
            <Link
              key={v.id}
              href={`/inventory/${v.slug}`}
              className="group snap-start shrink-0 w-[280px] sm:w-[300px] rounded-xl border border-white/5 bg-[#101010] transition-all duration-300 hover:-translate-y-[3px] hover:border-white/15 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.6)]"
            >
              <div className="relative aspect-16/10 overflow-hidden rounded-t-xl">
                <VehicleImage
                  src={v.images[0]?.url}
                  alt={`Used ${v.year} ${v.make} ${v.model} for sale in Paterson NJ — Speedway Motors`}
                  make={v.make}
                  model={v.model}
                  className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 badge-success text-[10px]">
                  <Sparkles className="h-3 w-3" />
                  Just Arrived
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-white group-hover:text-accent-light transition-colors">
                  {v.year} {v.make} {v.model}
                </h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-base font-bold text-accent-light">{formatPrice(v.price)}</span>
                  <span className="text-xs text-zinc-500">{formatMileage(v.mileage)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center">
        <Button href="/inventory?sort=date-added" variant="outline" size="md">
          See All New Arrivals
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </SectionWrapper>
  );
}
