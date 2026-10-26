import Link from "next/link";
import { Search, ChevronLeft, ChevronRight, Phone, X } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { RecentlyViewed } from "@/components/shared/RecentlyViewed";
import { InventoryAlertBar } from "@/components/shared/InventoryAlertBar";
import { InventoryListJsonLd } from "@/components/seo/InventoryListJsonLd";
import { InventoryViewToggle } from "@/components/shared/InventoryViewToggle";
import { MobileInventoryFilters } from "@/components/inventory/MobileInventoryFilters";
import { InventoryFiltersSidebar } from "@/components/inventory/InventoryFiltersSidebar";
import { InventoryGrid } from "@/components/inventory/InventoryGrid";
import { getInventory, getMakeSummaries } from "@/lib/data/inventory-source";
import { formatPrice } from "@/lib/data/vehicles-full";
import { hasInventoryRefinements, parseInventoryFilters } from "@/lib/inventory/filter-params";
import { MIN_VEHICLES_FOR_MAKE_PAGE, makePagePath } from "@/lib/inventory/make-pages";
import { pageMetadata } from "@/lib/seo/metadata";
import { BUSINESS } from "@/lib/constants";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const LISTING_TITLE = "Used Cars, SUVs & Trucks for Sale in Paterson, NJ";

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const filters = parseInventoryFilters(params);
  const { total, totalPages } = await getInventory(filters);
  const page = filters.page || 1;
  const description =
    "Browse quality used cars, SUVs, trucks, and vans at Speedway Motors in Paterson, NJ, with photos, mileage, and pricing online and financing options for all credit levels.";

  // Filtered, sorted, and searched views reorder or subset the same vehicles.
  // They stay crawlable (so vehicle links are followed) but out of the index;
  // brand pages under /inventory/make/* are the indexable alternative.
  if (hasInventoryRefinements(params)) {
    return pageMetadata({ title: `Search Results — ${LISTING_TITLE}`, description, path: "/inventory", noindex: true });
  }

  if (page > 1) {
    return pageMetadata({
      title: `${LISTING_TITLE} — Page ${page}`,
      description,
      path: `/inventory?page=${page}`,
      // A page number past the end (stale link after inventory shrinks) is
      // empty. (total === 0 can also mean inventory is briefly unavailable, so
      // it never triggers noindex on its own.)
      noindex: total > 0 && page > totalPages,
    });
  }

  return pageMetadata({ title: LISTING_TITLE, description, path: "/inventory" });
}

export default async function InventoryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = parseInventoryFilters(params);

  const [
    {
      vehicles,
      total,
      page,
      totalPages,
      filters: filterOptions,
    },
    makes,
  ] = await Promise.all([getInventory(filters), getMakeSummaries()]);
  const makeLinks = makes.filter((make) => make.count >= MIN_VEHICLES_FOR_MAKE_PAGE);
  const start = total === 0 ? 0 : (page - 1) * 24 + 1;
  const end = Math.min(page * 24, total);

  const activeFilters: { label: string; removeQuery: Record<string, string | string[] | undefined> }[] = [];
  if (filters.search) activeFilters.push({ label: `"${filters.search}"`, removeQuery: { ...params, search: undefined, page: undefined } });
  if (filters.make) activeFilters.push({ label: filters.make, removeQuery: { ...params, make: undefined, page: undefined } });
  if (filters.model) activeFilters.push({ label: filters.model, removeQuery: { ...params, model: undefined, page: undefined } });
  if (filters.bodyType) activeFilters.push({ label: filters.bodyType, removeQuery: { ...params, type: undefined, page: undefined } });
  if (filters.minPrice || filters.maxPrice) activeFilters.push({ label: `${filters.minPrice ? formatPrice(filters.minPrice) : "$0"}–${filters.maxPrice ? formatPrice(filters.maxPrice) : "$∞"}`, removeQuery: { ...params, priceMin: undefined, priceMax: undefined, page: undefined } });
  if (filters.minYear || filters.maxYear) activeFilters.push({ label: `${filters.minYear || "Any"}–${filters.maxYear || "Any"}`, removeQuery: { ...params, yearMin: undefined, yearMax: undefined, page: undefined } });
  if (filters.minMileage || filters.maxMileage) activeFilters.push({ label: `${filters.minMileage?.toLocaleString() || "0"}–${filters.maxMileage?.toLocaleString() || "Any"} mi`, removeQuery: { ...params, mileageMin: undefined, mileageMax: undefined, page: undefined } });
  if (filters.features?.length) {
    filters.features.forEach((feature) => {
      activeFilters.push({
        label: feature,
        removeQuery: {
          ...params,
          feature: filters.features!.filter((item) => item !== feature),
          page: undefined,
        },
      });
    });
  }

  return (
    <>
      <PageHero
        eyebrow="Browse Our Selection"
        title="Used Vehicles for Sale"
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

      <InventoryAlertBar filters={{ make: filters.make, type: filters.bodyType, priceMin: filters.minPrice ? String(filters.minPrice) : undefined, priceMax: filters.maxPrice ? String(filters.maxPrice) : undefined }} />
      <InventoryListJsonLd vehicles={vehicles} name="Used vehicles for sale at Speedway Motors" path={page > 1 ? `/inventory?page=${page}` : "/inventory"} />

      <div className="bg-[#0a0a0a] min-h-screen">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="w-full lg:w-72 shrink-0">
              <MobileInventoryFilters>
                <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
                  <InventoryFiltersSidebar
                    params={params}
                    filterOptions={filterOptions}
                    current={{
                      sortBy: filters.sortBy || "newest",
                      make: filters.make,
                      model: filters.model,
                      bodyType: filters.bodyType,
                      minYear: filters.minYear,
                      maxYear: filters.maxYear,
                      minMileage: filters.minMileage,
                      maxMileage: filters.maxMileage,
                      features: filters.features || [],
                    }}
                  />
                </div>
              </MobileInventoryFilters>
            </aside>

            <div className="flex-1">
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
                  <Link href="/inventory" className="text-xs text-zinc-500 hover:text-white transition-colors ml-1">Clear all</Link>
                </div>
              )}

              <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                <div>
                  <p className="text-sm text-zinc-500">Showing {start}–{end} of {total} vehicles</p>
                  <p className="text-xs text-zinc-600">Inventory last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                </div>
                <InventoryViewToggle />
              </div>

              {vehicles.length === 0 ? (
                <div className="text-center py-20 rounded-2xl border border-white/6 bg-surface-1">
                  <p className="text-lg text-zinc-400 mb-2">No vehicles match your criteria.</p>
                  <p className="text-sm text-zinc-500 mb-4">Try removing some filters to see more results.</p>
                  <Link href="/inventory" className="inline-block text-sm font-semibold text-accent-light hover:text-white transition-colors mb-4">Clear all filters</Link>
                  <div className="mt-4 pt-4 border-t border-white/6 max-w-sm mx-auto">
                    <p className="text-sm text-zinc-500 mb-2">Can&apos;t find what you&apos;re looking for?</p>
                    <a href={BUSINESS.phoneHref} className="inline-flex items-center gap-2 text-sm font-semibold text-accent-light hover:text-white transition-colors">
                      <Phone className="h-4 w-4" />
                      Call us at {BUSINESS.phone}
                    </a>
                  </div>
                </div>
              ) : (
                <InventoryGrid vehicles={vehicles} />
              )}

              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-3">
                  {page > 1 && (
                    <Link
                      href={{ pathname: "/inventory", query: { ...params, page: String(page - 1) } }}
                      className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium border border-white/10 rounded-xl text-zinc-300 hover:bg-white/4 transition-all"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Link>
                  )}
                  <span className="px-4 py-2 text-sm text-zinc-500">Page {page} of {totalPages}</span>
                  {page < totalPages && (
                    <Link
                      href={{ pathname: "/inventory", query: { ...params, page: String(page + 1) } }}
                      className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium border border-white/10 rounded-xl text-zinc-300 hover:bg-white/4 transition-all"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {makeLinks.length > 0 && (
            <nav aria-labelledby="browse-by-make" className="mt-14 border-t border-white/6 pt-8">
              <h2 id="browse-by-make" className="text-lg font-semibold text-white mb-4">Browse by Make</h2>
              <ul className="flex flex-wrap gap-2">
                {makeLinks.map((make) => (
                  <li key={make.slug}>
                    <Link
                      href={makePagePath(make.slug)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/3 px-3.5 py-1.5 text-sm text-zinc-300 hover:border-white/20 hover:text-white transition-colors"
                    >
                      Used {make.name}
                      <span className="text-xs text-zinc-500">({make.count})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <RecentlyViewed />
        </div>
      </div>
    </>
  );
}
