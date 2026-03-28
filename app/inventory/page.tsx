import Link from "next/link";
import { Search, ArrowRight, Fuel, Gauge, Settings2, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
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

  const {
    vehicles,
    total,
    page,
    totalPages,
    filters: filterOptions,
  } = await getInventory(filters);
  const start = (page - 1) * 24 + 1;
  const end = Math.min(page * 24, total);

  return (
    <>
      {/* Hero / Search */}
      <PageHero
        eyebrow="Browse Our Selection"
        title="Our Inventory"
        subtitle={`${total} quality pre-owned vehicles ready for you.`}
        compact
      >
        <form className="max-w-2xl flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              name="search"
              defaultValue={filters.search}
              placeholder="Search by make, model, or keyword..."
              className="input-dark pl-11"
            />
          </div>
          <button
            type="submit"
            className="px-8 py-3 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-light transition-all duration-300 shadow-[0_2px_12px_rgba(196,18,48,0.25)]"
          >
            Search
          </button>
        </form>
      </PageHero>

      {/* Main content */}
      <div className="bg-[#0a0a0a] min-h-screen">
        <div className="mx-auto max-w-[80rem] px-5 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-60 flex-shrink-0">
              <div className="sticky top-24 space-y-5">
                {/* Sort */}
                <div className="rounded-xl border border-white/[0.06] bg-surface-1 p-4">
                  <h3 className="text-[11px] font-semibold text-accent-light uppercase tracking-[0.15em] mb-3">
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
                            ? "bg-accent/10 text-accent-light font-medium"
                            : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                        }`}
                      >
                        {opt.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Make filter */}
                {filterOptions.makes.length > 0 && (
                  <div className="rounded-xl border border-white/[0.06] bg-surface-1 p-4">
                    <h3 className="text-[11px] font-semibold text-accent-light uppercase tracking-[0.15em] mb-3">
                      Make
                    </h3>
                    <div className="space-y-0.5 max-h-48 overflow-y-auto">
                      {filters.make && (
                        <Link
                          href={{
                            pathname: "/inventory",
                            query: { ...params, make: undefined, page: undefined },
                          }}
                          className="block text-sm px-3 py-2 rounded-lg text-accent-light font-medium hover:bg-accent/10"
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
                              ? "bg-accent/10 text-accent-light font-medium"
                              : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                          }`}
                        >
                          {m.name}{" "}
                          <span className="text-zinc-600">({m.count})</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Body Type filter */}
                {filterOptions.bodyTypes.length > 0 && (
                  <div className="rounded-xl border border-white/[0.06] bg-surface-1 p-4">
                    <h3 className="text-[11px] font-semibold text-accent-light uppercase tracking-[0.15em] mb-3">
                      Body Type
                    </h3>
                    <div className="space-y-0.5">
                      {filters.bodyType && (
                        <Link
                          href={{
                            pathname: "/inventory",
                            query: {
                              ...params,
                              type: undefined,
                              page: undefined,
                            },
                          }}
                          className="block text-sm px-3 py-2 rounded-lg text-accent-light font-medium hover:bg-accent/10"
                        >
                          ✕ Clear
                        </Link>
                      )}
                      {filterOptions.bodyTypes.map((bt) => (
                        <Link
                          key={bt.name}
                          href={{
                            pathname: "/inventory",
                            query: {
                              ...params,
                              type: bt.name,
                              page: undefined,
                            },
                          }}
                          className={`block text-sm px-3 py-2 rounded-lg capitalize transition-colors ${
                            filters.bodyType === bt.name
                              ? "bg-accent/10 text-accent-light font-medium"
                              : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                          }`}
                        >
                          {bt.name}{" "}
                          <span className="text-zinc-600">({bt.count})</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Range filter */}
                <div className="rounded-xl border border-white/[0.06] bg-surface-1 p-4">
                  <h3 className="text-[11px] font-semibold text-accent-light uppercase tracking-[0.15em] mb-3">
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
                        className="block text-sm px-3 py-2 rounded-lg text-accent-light font-medium hover:bg-accent/10"
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
                          className="block text-sm px-3 py-2 rounded-lg text-zinc-400 hover:bg-white/[0.04] hover:text-white transition-colors"
                        >
                          {pr.label}{" "}
                          <span className="text-zinc-600">({pr.count})</span>
                        </Link>
                      ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Vehicle Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-zinc-500">
                  Showing {start}–{end} of {total} vehicles
                </p>
              </div>

              {vehicles.length === 0 ? (
                <div className="text-center py-20 rounded-2xl border border-white/[0.06] bg-surface-1">
                  <div className="w-16 h-16 mx-auto rounded-xl bg-white/[0.04] flex items-center justify-center mb-4">
                    <Search className="h-7 w-7 text-zinc-600" />
                  </div>
                  <p className="text-lg text-zinc-400 mb-2">
                    No vehicles match your criteria.
                  </p>
                  <Link
                    href="/inventory"
                    className="inline-block text-sm font-semibold text-accent-light hover:text-white transition-colors"
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
                        {vehicle.isFeatured && (
                          <span className="absolute top-3 left-3 badge-accent text-[10px]">
                            Featured
                          </span>
                        )}
                        {vehicle.isNewArrival && !vehicle.isFeatured && (
                          <span className="absolute top-3 left-3 badge-success text-[10px]">
                            New Arrival
                          </span>
                        )}
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
                          <p className="text-sm text-zinc-500 mt-0.5">
                            {vehicle.trim}
                          </p>
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-3">
                  {page > 1 && (
                    <Link
                      href={{
                        pathname: "/inventory",
                        query: { ...params, page: String(page - 1) },
                      }}
                      className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium border border-white/[0.1] rounded-xl text-zinc-300 hover:bg-white/[0.04] transition-all"
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
                      className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium border border-white/[0.1] rounded-xl text-zinc-300 hover:bg-white/[0.04] transition-all"
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
