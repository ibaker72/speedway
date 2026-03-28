import Link from "next/link";
import { Search, ArrowRight, Fuel, Gauge, Settings2, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { VehicleImage } from "@/components/shared/VehicleImage";
import { getInventory } from "@/lib/data/inventory-source";
import { formatPrice, formatMileage } from "@/lib/data/vehicles-full";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Inventory",
  description: "Browse 180+ quality used cars, SUVs, trucks, and vans at Speedway Motors in Paterson, NJ. Competitive prices and financing available.",
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
    drivetrain: typeof params.drivetrain === "string" ? params.drivetrain : undefined,
    sortBy: (typeof params.sort === "string" ? params.sort : "newest") as "price-asc" | "price-desc" | "year-desc" | "year-asc" | "mileage-asc" | "newest",
    page: params.page ? Number(params.page) : 1,
    perPage: 24,
  };

  const { vehicles, total, page, totalPages, filters: filterOptions } = await getInventory(filters);
  const start = (page - 1) * 24 + 1;
  const end = Math.min(page * 24, total);

  return (
    <>
      {/* Search header */}
      <SectionWrapper background="charcoal" className="py-10 md:py-14">
        <SectionHeading
          title="Our Inventory"
          subtitle={`${total} quality pre-owned vehicles ready for you.`}
          as="h1"
        />
        <div className="max-w-3xl mx-auto">
          <form className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                name="search"
                defaultValue={filters.search}
                placeholder="Search by make, model, or keyword..."
                className="premium-input pl-11"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl text-sm font-semibold hover:from-red-800 hover:to-red-700 transition-all shadow-lg shadow-red-900/20"
            >
              Search
            </button>
          </form>
        </div>
      </SectionWrapper>

      {/* Main content */}
      <div className="bg-zinc-50 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full lg:w-60 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Sort */}
                <div className="bg-white rounded-xl border border-zinc-200/80 p-4 shadow-sm">
                  <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-3">
                    Sort By
                  </h3>
                  <div className="space-y-0.5">
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
                        className={`block text-sm px-3 py-2 rounded-lg transition-colors ${
                          filters.sortBy === opt.value
                            ? "bg-red-50 text-red-700 font-medium"
                            : "text-zinc-600 hover:bg-zinc-50"
                        }`}
                      >
                        {opt.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Make filter */}
                {filterOptions.makes.length > 0 && (
                  <div className="bg-white rounded-xl border border-zinc-200/80 p-4 shadow-sm">
                    <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-3">
                      Make
                    </h3>
                    <div className="space-y-0.5 max-h-48 overflow-y-auto">
                      {filters.make && (
                        <Link
                          href={{
                            pathname: "/inventory",
                            query: { ...params, make: undefined, page: undefined },
                          }}
                          className="block text-sm px-3 py-2 rounded-lg text-red-700 font-medium hover:bg-red-50"
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
                          className={`block text-sm px-3 py-2 rounded-lg transition-colors ${
                            filters.make === m.name
                              ? "bg-red-50 text-red-700 font-medium"
                              : "text-zinc-600 hover:bg-zinc-50"
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
                  <div className="bg-white rounded-xl border border-zinc-200/80 p-4 shadow-sm">
                    <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-3">
                      Body Type
                    </h3>
                    <div className="space-y-0.5">
                      {filters.bodyType && (
                        <Link
                          href={{
                            pathname: "/inventory",
                            query: { ...params, type: undefined, page: undefined },
                          }}
                          className="block text-sm px-3 py-2 rounded-lg text-red-700 font-medium hover:bg-red-50"
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
                          className={`block text-sm px-3 py-2 rounded-lg capitalize transition-colors ${
                            filters.bodyType === bt.name
                              ? "bg-red-50 text-red-700 font-medium"
                              : "text-zinc-600 hover:bg-zinc-50"
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
                <div className="bg-white rounded-xl border border-zinc-200/80 p-4 shadow-sm">
                  <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-3">
                    Price Range
                  </h3>
                  <div className="space-y-0.5">
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
                        className="block text-sm px-3 py-2 rounded-lg text-red-700 font-medium hover:bg-red-50"
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
                          className="block text-sm px-3 py-2 rounded-lg text-zinc-600 hover:bg-zinc-50 transition-colors"
                        >
                          {pr.label}{" "}
                          <span className="text-zinc-400">({pr.count})</span>
                        </Link>
                      ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-zinc-500">
                  Showing {start}–{end} of {total} vehicles
                </p>
              </div>

              {vehicles.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-zinc-200/80">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
                    <Search className="h-7 w-7 text-zinc-300" />
                  </div>
                  <p className="text-lg text-zinc-500 mb-2">
                    No vehicles match your criteria.
                  </p>
                  <Link
                    href="/inventory"
                    className="inline-block text-sm font-semibold text-red-700 hover:text-red-800"
                  >
                    Clear all filters
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {vehicles.map((vehicle) => (
                    <Link
                      key={vehicle.id}
                      href={`/inventory/${vehicle.slug}`}
                      className="group rounded-2xl border border-zinc-200/80 bg-white overflow-hidden hover:shadow-xl hover:shadow-zinc-200/40 hover:border-zinc-300 transition-all duration-500"
                    >
                      <div className="aspect-[16/10] relative overflow-hidden bg-zinc-100">
                        <VehicleImage
                          src={vehicle.images[0]?.url}
                          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                          make={vehicle.make}
                          model={vehicle.model}
                          className="w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                        {vehicle.isFeatured && (
                          <span className="absolute top-3 left-3 bg-zinc-900/80 text-accent text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-md flex items-center gap-1.5 border border-white/10">
                            <Star className="h-3 w-3 fill-accent text-accent" />
                            Featured
                          </span>
                        )}
                        {vehicle.isNewArrival && !vehicle.isFeatured && (
                          <span className="absolute top-3 left-3 bg-green-900/80 text-green-100 text-xs font-medium px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10">
                            New Arrival
                          </span>
                        )}
                        <div className="absolute bottom-3 right-3 bg-zinc-900/85 backdrop-blur-md rounded-lg px-3.5 py-2 border border-white/10">
                          <span className="text-lg font-display text-accent">
                            {formatPrice(vehicle.price)}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 md:p-5">
                        <div className="mb-3">
                          <h3 className="font-semibold text-zinc-900 leading-tight group-hover:text-red-700 transition-colors">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </h3>
                          {vehicle.trim && (
                            <p className="text-sm text-zinc-400 mt-0.5">
                              {vehicle.trim}
                            </p>
                          )}
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
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1.5 transition-transform duration-300" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-3">
                  {page > 1 && (
                    <Link
                      href={{
                        pathname: "/inventory",
                        query: { ...params, page: String(page - 1) },
                      }}
                      className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-sm"
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
                      className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-sm"
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
      </div>
    </>
  );
}
