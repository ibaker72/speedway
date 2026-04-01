import Link from "next/link";
import { Search, ArrowRight, Fuel, Gauge, Settings2, ChevronLeft, ChevronRight, ShieldCheck, Phone, X } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { VehicleImage } from "@/components/shared/VehicleImage";
import { MobileFilterToggle } from "@/components/shared/MobileFilterToggle";
import { InventoryViewToggle } from "@/components/shared/InventoryViewToggle";
import { RecentlyViewed } from "@/components/shared/RecentlyViewed";
import { InventoryAlertBar } from "@/components/shared/InventoryAlertBar";
import { InventoryListJsonLd } from "@/components/seo/InventoryListJsonLd";
import { getInventory } from "@/lib/data/inventory-source";
import { formatPrice, formatMileage, estimateMonthlyPayment } from "@/lib/data/vehicles-full";
import { BUSINESS } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Used Cars, SUVs & Trucks for Sale in Paterson, NJ | Speedway Motors",
  description:
    "Browse 180+ quality used cars, SUVs, trucks, and vans at Speedway Motors in Paterson, NJ. Competitive prices, flexible financing for all credit levels, and Carfax reports on every vehicle.",
  alternates: {
    canonical: "https://www.speedwaymotorsllc.com/inventory",
  },
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
      | "newest"
      | "date-added",
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

  // Active filters for summary bar
  const activeFilters: { label: string; removeQuery: Record<string, string | undefined> }[] = [];
  if (filters.search) activeFilters.push({ label: `"${filters.search}"`, removeQuery: { ...params, search: undefined, page: undefined } as Record<string, string | undefined> });
  if (filters.make) activeFilters.push({ label: filters.make, removeQuery: { ...params, make: undefined, page: undefined } as Record<string, string | undefined> });
  if (filters.bodyType) activeFilters.push({ label: filters.bodyType, removeQuery: { ...params, type: undefined, page: undefined } as Record<string, string | undefined> });
  if (filters.minPrice || filters.maxPrice) activeFilters.push({ label: `${filters.minPrice ? formatPrice(filters.minPrice) : "$0"}–${filters.maxPrice ? formatPrice(filters.maxPrice) : "$∞"}`, removeQuery: { ...params, priceMin: undefined, priceMax: undefined, page: undefined } as Record<string, string | undefined> });
  if (filters.minYear || filters.maxYear) activeFilters.push({ label: `${filters.minYear || "Any"}–${filters.maxYear || "Any"}`, removeQuery: { ...params, yearMin: undefined, yearMax: undefined, page: undefined } as Record<string, string | undefined> });

  // Year range for year filter
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 2010 + 1 }, (_, i) => currentYear - i);

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

      {/* Inventory Alert Bar */}
      <InventoryAlertBar filters={{ make: filters.make, type: filters.bodyType, priceMin: filters.minPrice ? String(filters.minPrice) : undefined, priceMax: filters.maxPrice ? String(filters.maxPrice) : undefined }} />

      <InventoryListJsonLd vehicles={vehicles} total={total} />

      {/* Main content */}
      <div className="bg-[#0a0a0a] min-h-screen">
        <div className="mx-auto max-w-[80rem] px-5 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-60 flex-shrink-0">
              <MobileFilterToggle>
              <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto space-y-5">
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
                      { value: "date-added", label: "Recently Added" },
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

                {/* Year Range filter */}
                <div className="rounded-xl border border-white/[0.06] bg-surface-1 p-4">
                  <h3 className="text-[11px] font-semibold text-accent-light uppercase tracking-[0.15em] mb-3">
                    Year Range
                  </h3>
                  <form className="flex items-center gap-2">
                    {/* Preserve all other active query params */}
                    {params.search && <input type="hidden" name="search" value={String(params.search)} />}
                    {params.make && <input type="hidden" name="make" value={String(params.make)} />}
                    {params.sort && <input type="hidden" name="sort" value={String(params.sort)} />}
                    {params.priceMin && <input type="hidden" name="priceMin" value={String(params.priceMin)} />}
                    {params.priceMax && <input type="hidden" name="priceMax" value={String(params.priceMax)} />}
                    {params.type && <input type="hidden" name="type" value={String(params.type)} />}
                    {params.drivetrain && <input type="hidden" name="drivetrain" value={String(params.drivetrain)} />}
                    <select name="yearMin" defaultValue={filters.minYear || ""} className="select-dark text-xs py-2">
                      <option value="">Min Year</option>
                      {yearOptions.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <span className="text-zinc-600 text-xs">to</span>
                    <select name="yearMax" defaultValue={filters.maxYear || ""} className="select-dark text-xs py-2">
                      <option value="">Max Year</option>
                      {yearOptions.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <button type="submit" className="px-3 py-2 bg-accent/20 text-accent-light rounded-lg text-xs font-semibold hover:bg-accent/30 transition-colors">Go</button>
                  </form>
                </div>

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
              </MobileFilterToggle>
            </aside>

            {/* Vehicle Grid */}
            <div className="flex-1">
              {/* Active Filters Bar */}
              {activeFilters.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <span className="text-xs text-zinc-500 font-medium">Active:</span>
                  {activeFilters.map((af) => (
                    <Link
                      key={af.label}
                      href={{ pathname: "/inventory", query: af.removeQuery }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-xs font-medium text-accent-light hover:bg-accent/20 transition-colors"
                    >
                      {af.label}
                      <X className="h-3 w-3" />
                    </Link>
                  ))}
                  <Link
                    href="/inventory"
                    className="text-xs text-zinc-500 hover:text-white transition-colors ml-1"
                  >
                    Clear all
                  </Link>
                </div>
              )}

              <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                <div>
                  <p className="text-sm text-zinc-500">
                    Showing {start}–{end} of {total} vehicles
                  </p>
                  <p className="text-xs text-zinc-600">
                    Inventory last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <InventoryViewToggle />
              </div>

              {vehicles.length === 0 ? (
                <div className="text-center py-20 rounded-2xl border border-white/[0.06] bg-surface-1">
                  <div className="w-16 h-16 mx-auto rounded-xl bg-white/[0.04] flex items-center justify-center mb-4">
                    <Search className="h-7 w-7 text-zinc-600" />
                  </div>
                  <p className="text-lg text-zinc-400 mb-2">
                    No vehicles match your criteria.
                  </p>
                  {activeFilters.length > 0 && (
                    <p className="text-sm text-zinc-500 mb-4">Try removing some filters to see more results.</p>
                  )}
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {["SUV", "Sedan", "Truck"].map((q) => (
                      <Link
                        key={q}
                        href={{ pathname: "/inventory", query: { type: q.toLowerCase() } }}
                        className="px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-300 hover:bg-white/[0.08] transition-colors"
                      >
                        Popular: {q}s
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/inventory"
                    className="inline-block text-sm font-semibold text-accent-light hover:text-white transition-colors mb-4"
                  >
                    Clear all filters
                  </Link>
                  <div className="mt-4 pt-4 border-t border-white/[0.06] max-w-sm mx-auto">
                    <p className="text-sm text-zinc-500 mb-2">Can&apos;t find what you&apos;re looking for?</p>
                    <a
                      href={BUSINESS.phoneHref}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-accent-light hover:text-white transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      Call us at {BUSINESS.phone}
                    </a>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5" id="vehicle-grid">
                  {vehicles.map((vehicle) => {
                    const estMonthly = vehicle.estimatedPayment || estimateMonthlyPayment(vehicle.price);
                    return (
                      <Link
                        key={vehicle.id}
                        href={`/inventory/${vehicle.slug}`}
                        className="card-vehicle group block"
                      >
                        <div className="aspect-[16/10] relative overflow-hidden">
                          <VehicleImage
                            src={vehicle.images[0]?.url}
                            alt={`Used ${vehicle.year} ${vehicle.make} ${vehicle.model} for sale in Paterson NJ — Speedway Motors`}
                            make={vehicle.make}
                            model={vehicle.model}
                            className="w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          {/* Quick View overlay (desktop only) */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex items-center justify-center">
                            <span className="text-sm font-semibold text-white border border-white/30 rounded-lg px-4 py-2 backdrop-blur-sm">
                              Quick View
                            </span>
                          </div>
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
                          <span className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm text-zinc-300 text-[10px] font-semibold px-2 py-1 rounded">
                            <ShieldCheck className="h-3 w-3" />
                            Carfax
                          </span>
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
                          <div className="mt-3">
                            <span className="text-xl font-bold text-accent-light">
                              {formatPrice(vehicle.price)}
                            </span>
                            <span className="block text-xs text-zinc-500 mt-0.5">
                              Est. ${estMonthly}/mo
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-3 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 bg-white/[0.04] border border-white/[0.06] rounded-full px-2.5 py-1">
                              <Gauge className="h-3 w-3" />
                              {formatMileage(vehicle.mileage)}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 bg-white/[0.04] border border-white/[0.06] rounded-full px-2.5 py-1">
                              <Settings2 className="h-3 w-3" />
                              {vehicle.transmission}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 bg-white/[0.04] border border-white/[0.06] rounded-full px-2.5 py-1">
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
                  })}
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

          <RecentlyViewed />
        </div>
      </div>
    </>
  );
}
