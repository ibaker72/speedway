import Link from "next/link";
import {
  Search,
  ArrowRight,
  Fuel,
  Gauge,
  Settings2,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { VehicleImage } from "@/components/shared/VehicleImage";
import { getInventory } from "@/lib/data/inventory-source";
import { formatPrice, formatMileage } from "@/lib/data/vehicles-full";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Inventory",
  description:
    "Browse 180+ quality used cars, SUVs, trucks, and vans at Speedway Motors in Paterson, NJ. Competitive prices and financing available.",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function InventoryPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const filters = {
    search: typeof params.search === "string" ? params.search : undefined,
    make: typeof params.make === "string" ? params.make : undefined,
    bodyType: typeof params.type === "string" ? params.type : undefined,
    minPrice: params.priceMin ? Number(params.priceMin) : undefined,
    maxPrice: params.priceMax ? Number(params.priceMax) : undefined,
    minYear: params.yearMin ? Number(params.yearMin) : undefined,
    maxYear: params.yearMax ? Number(params.yearMax) : undefined,
    drivetrain:
      typeof params.drivetrain === "string" ? params.drivetrain : undefined,
    sortBy: (typeof params.sort === "string" ? params.sort : "newest") as
      | "price-asc"
      | "price-desc"
      | "year-desc"
      | "year-asc"
      | "mileage-asc"
      | "newest",
    page: params.page ? Number(params.page) : 1,
    perPage: 24,
  };

  const { vehicles, total, page, totalPages, filters: filterOptions } =
    await getInventory(filters);

  const start = (page - 1) * 24 + 1;
  const end = Math.min(page * 24, total);

  return (
    <>
      <SectionWrapper background="light" className="py-10 md:py-12">
        <SectionHeading
          title="Our Inventory"
          subtitle={`${total} quality pre-owned vehicles ready for you.`}
          as="h1"
        />

        {/* Search bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <form className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                name="search"
                defaultValue={filters.search}
                placeholder="Search by make, model, or keyword..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-zinc-300 bg-white text-sm focus:outline-none focus:border-red-700"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-red-700 text-white rounded-lg text-sm font-semibold hover:bg-red-800 transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </SectionWrapper>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Sort */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 mb-2">
                  Sort By
                </h3>
                <div className="space-y-1">
                  {[
                    { value: "newest", label: "Newest First" },
                    { value: "price-asc", label: "Price: Low to High" },
                    { value: "price-desc", label: "Price: High to Low" },
                    { value: "mileage-asc", label: "Mileage: Low to High" },
                    { value: "year-desc", label: "Year: New to Old" },
                  ].map((opt) => (
                    <Link
                      key={opt.value}
                      href={{
                        pathname: "/inventory",
                        query: { ...params, sort: opt.value, page: undefined },
                      }}
                      className={`block text-sm px-3 py-1.5 rounded-md transition-colors ${
                        filters.sortBy === opt.value
                          ? "bg-red-50 text-red-700 font-medium"
                          : "text-zinc-600 hover:bg-zinc-100"
                      }`}
                    >
                      {opt.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Make filter */}
              {filterOptions.makes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 mb-2">
                    Make
                  </h3>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {filters.make && (
                      <Link
                        href={{
                          pathname: "/inventory",
                          query: { ...params, make: undefined, page: undefined },
                        }}
                        className="block text-sm px-3 py-1.5 rounded-md text-red-700 font-medium hover:bg-red-50"
                      >
                        ✕ Clear
                      </Link>
                    )}
                    {filterOptions.makes.map((m) => (
                      <Link
                        key={m.name}
                        href={{
                          pathname: "/inventory",
                          query: { ...params, make: m.name, page: undefined },
                        }}
                        className={`block text-sm px-3 py-1.5 rounded-md transition-colors ${
                          filters.make === m.name
                            ? "bg-red-50 text-red-700 font-medium"
                            : "text-zinc-600 hover:bg-zinc-100"
                        }`}
                      >
                        {m.name}{" "}
                        <span className="text-zinc-400">({m.count})</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Body Type filter */}
              {filterOptions.bodyTypes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 mb-2">
                    Body Type
                  </h3>
                  <div className="space-y-1">
                    {filters.bodyType && (
                      <Link
                        href={{
                          pathname: "/inventory",
                          query: { ...params, type: undefined, page: undefined },
                        }}
                        className="block text-sm px-3 py-1.5 rounded-md text-red-700 font-medium hover:bg-red-50"
                      >
                        ✕ Clear
                      </Link>
                    )}
                    {filterOptions.bodyTypes.map((bt) => (
                      <Link
                        key={bt.name}
                        href={{
                          pathname: "/inventory",
                          query: { ...params, type: bt.name, page: undefined },
                        }}
                        className={`block text-sm px-3 py-1.5 rounded-md capitalize transition-colors ${
                          filters.bodyType === bt.name
                            ? "bg-red-50 text-red-700 font-medium"
                            : "text-zinc-600 hover:bg-zinc-100"
                        }`}
                      >
                        {bt.name}{" "}
                        <span className="text-zinc-400">({bt.count})</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range filter */}
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 mb-2">
                  Price Range
                </h3>
                <div className="space-y-1">
                  {(filters.minPrice || filters.maxPrice) && (
                    <Link
                      href={{
                        pathname: "/inventory",
                        query: {
                          ...params,
                          priceMin: undefined,
                          priceMax: undefined,
                          page: undefined,
                        },
                      }}
                      className="block text-sm px-3 py-1.5 rounded-md text-red-700 font-medium hover:bg-red-50"
                    >
                      ✕ Clear
                    </Link>
                  )}
                  {filterOptions.priceRanges
                    .filter((pr) => pr.count > 0)
                    .map((pr) => (
                      <Link
                        key={pr.label}
                        href={{
                          pathname: "/inventory",
                          query: {
                            ...params,
                            priceMin:
                              pr.min > 0 ? String(pr.min) : undefined,
                            priceMax:
                              pr.max < 999999 ? String(pr.max) : undefined,
                            page: undefined,
                          },
                        }}
                        className="block text-sm px-3 py-1.5 rounded-md text-zinc-600 hover:bg-zinc-100 transition-colors"
                      >
                        {pr.label}{" "}
                        <span className="text-zinc-400">({pr.count})</span>
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Vehicle grid */}
          <div className="flex-1">
            {/* Results count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-zinc-500">
                Showing {start}–{end} of {total} vehicles
              </p>
            </div>

            {vehicles.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-lg text-zinc-500">
                  No vehicles match your criteria.
                </p>
                <Link
                  href="/inventory"
                  className="mt-4 inline-block text-sm font-semibold text-red-700 hover:text-red-800"
                >
                  Clear all filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
                      {vehicle.isFeatured && (
                        <span className="absolute top-3 left-3 bg-amber-800/90 text-amber-100 text-xs font-medium px-2.5 py-1 rounded-md backdrop-blur-sm flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                          Featured
                        </span>
                      )}
                      {vehicle.isNewArrival && !vehicle.isFeatured && (
                        <span className="absolute top-3 left-3 bg-green-800/90 text-green-100 text-xs font-medium px-2.5 py-1 rounded-md backdrop-blur-sm">
                          New Arrival
                        </span>
                      )}
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
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg font-display text-accent">
                            {formatPrice(vehicle.price)}
                          </div>
                          {vehicle.estimatedPayment && (
                            <div className="text-xs text-zinc-400">
                              Est. ${vehicle.estimatedPayment}/mo
                            </div>
                          )}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={{
                      pathname: "/inventory",
                      query: { ...params, page: String(page - 1) },
                    }}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Link>
                )}
                <span className="px-4 py-2 text-sm text-zinc-500">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={{
                      pathname: "/inventory",
                      query: { ...params, page: String(page + 1) },
                    }}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
