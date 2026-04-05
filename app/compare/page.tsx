import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { getInventory } from "@/lib/data/inventory-source";
import { VehicleImage } from "@/components/shared/VehicleImage";
import { formatPrice, formatMileage, estimateMonthlyPayment } from "@/lib/data/vehicles-full";
import { BUSINESS } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Vehicles",
  description:
    "Compare vehicles side-by-side at Speedway Motors. Find the best car for your needs by comparing specs, prices, and features.",
  alternates: {
    canonical: "https://www.speedwaymotorsllc.com/compare",
  },
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ComparePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const slugs = typeof params.vehicles === "string"
    ? params.vehicles.split(",").slice(0, 3)
    : [];

  const { vehicles: allVehicles } = await getInventory({ perPage: 999 });
  const compareVehicles = slugs
    .map((slug) => allVehicles.find((v) => v.slug === slug))
    .filter(Boolean);

  const specRows = [
    { label: "Price", get: (v: typeof compareVehicles[0]) => formatPrice(v!.price) },
    { label: "Year", get: (v: typeof compareVehicles[0]) => String(v!.year) },
    { label: "Mileage", get: (v: typeof compareVehicles[0]) => formatMileage(v!.mileage) },
    { label: "Engine", get: (v: typeof compareVehicles[0]) => v!.engine },
    { label: "Transmission", get: (v: typeof compareVehicles[0]) => v!.transmission },
    { label: "Drivetrain", get: (v: typeof compareVehicles[0]) => v!.drivetrain },
    { label: "Fuel Type", get: (v: typeof compareVehicles[0]) => v!.fuelType },
    { label: "Exterior Color", get: (v: typeof compareVehicles[0]) => v!.exteriorColor },
    { label: "Interior Color", get: (v: typeof compareVehicles[0]) => v!.interiorColor },
    { label: "Body Type", get: (v: typeof compareVehicles[0]) => v!.bodyType },
    { label: "Est. Payment", get: (v: typeof compareVehicles[0]) => `$${v!.estimatedPayment || estimateMonthlyPayment(v!.price)}/mo` },
  ];

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${BUSINESS.website}/` },
          { name: "Inventory", url: `${BUSINESS.website}/inventory` },
          { name: "Compare", url: `${BUSINESS.website}/compare` },
        ]}
      />
      <PageHero
        eyebrow="Compare"
        title="Compare Vehicles"
        subtitle="View specifications side-by-side to find your perfect match."
        compact
      />

      <div className="bg-[#0a0a0a] min-h-screen">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 py-8 md:py-12">
          {compareVehicles.length === 0 ? (
            <div className="text-center py-20 rounded-2xl border border-white/6 bg-surface-1">
              <div className="w-16 h-16 mx-auto rounded-xl bg-white/4 flex items-center justify-center mb-4">
                <Search className="h-7 w-7 text-zinc-600" />
              </div>
              <p className="text-lg text-zinc-400 mb-2">No vehicles selected for comparison.</p>
              <p className="text-sm text-zinc-500 mb-6">Browse our inventory and select vehicles to compare.</p>
              <Link
                href="/inventory"
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-light transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                Browse Inventory
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-150">
                {/* Vehicle headers */}
                <thead>
                  <tr>
                    <th className="text-left p-3 text-xs text-zinc-500 font-medium w-40" />
                    {compareVehicles.map((v) => (
                      <th key={v!.id} className="p-3 text-center">
                        <Link href={`/inventory/${v!.slug}`} className="group block">
                          <div className="aspect-16/10 rounded-xl overflow-hidden relative bg-surface-1 mb-3 mx-auto max-w-70">
                            <VehicleImage
                              src={v!.images[0]?.url}
                              alt={`${v!.year} ${v!.make} ${v!.model}`}
                              make={v!.make}
                              model={v!.model}
                              className="group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <p className="text-sm font-semibold text-white group-hover:text-accent-light transition-colors">
                            {v!.year} {v!.make} {v!.model}
                          </p>
                          {v!.trim && <p className="text-xs text-zinc-500">{v!.trim}</p>}
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {specRows.map((row, i) => {
                    const values = compareVehicles.map((v) => row.get(v));
                    const allSame = values.every((val) => val === values[0]);
                    return (
                      <tr
                        key={row.label}
                        className={i % 2 === 0 ? "bg-white/2" : ""}
                      >
                        <td className="p-3 text-xs font-medium text-zinc-400">{row.label}</td>
                        {compareVehicles.map((v, j) => (
                          <td
                            key={v!.id}
                            className={`p-3 text-center text-sm ${
                              !allSame && row.label === "Price"
                                ? values[j] === [...values].sort()[0]
                                  ? "text-emerald-400 font-semibold"
                                  : "text-white"
                                : allSame
                                ? "text-zinc-400"
                                : "text-white font-medium"
                            }`}
                          >
                            {row.get(v)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
