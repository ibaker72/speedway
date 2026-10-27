import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { Button } from "@/components/ui/button";
import { InventoryGrid } from "@/components/inventory/InventoryGrid";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { InventoryListJsonLd } from "@/components/seo/InventoryListJsonLd";
import { dealerConfig } from "@/dealer.config";
import { BUSINESS } from "@/lib/constants";
import { getInventory, getMakeSummaries, type MakeSummary } from "@/lib/data/inventory-source";
import { MIN_VEHICLES_FOR_MAKE_PAGE, makePagePath } from "@/lib/inventory/make-pages";
import { pageMetadata } from "@/lib/seo/metadata";
import type { Vehicle } from "@/lib/types/vehicle";
import type { Metadata } from "next";

// Rendered on demand and cached; refreshed every 10 minutes so the listing
// tracks the daily inventory sync.
export const revalidate = 600;
export const dynamicParams = true;

export async function generateStaticParams() {
  // Avoid inventory calls at build time; pages are generated on first request.
  return [];
}

const PAGE_SIZE = 60;

interface PageProps {
  params: Promise<{ make: string }>;
}

async function loadMakePage(slug: string): Promise<{ make: MakeSummary; vehicles: Vehicle[]; others: MakeSummary[] } | null> {
  const makes = await getMakeSummaries();
  const make = makes.find((entry) => entry.slug === slug);
  if (!make || make.count < MIN_VEHICLES_FOR_MAKE_PAGE) return null;
  const { vehicles } = await getInventory({ make: make.name, perPage: PAGE_SIZE, sortBy: "newest" });
  if (vehicles.length === 0) return null;
  const others = makes.filter((entry) => entry.slug !== slug && entry.count >= MIN_VEHICLES_FOR_MAKE_PAGE);
  return { make, vehicles, others };
}

function topModels(vehicles: Vehicle[]): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const vehicle of vehicles) counts.set(vehicle.model, (counts.get(vehicle.model) || 0) + 1);
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { make: slug } = await params;
  const data = await loadMakePage(slug);
  if (!data) return { title: "Make Not Found", robots: { index: false, follow: true } };
  const { make, vehicles } = data;
  const models = topModels(vehicles).slice(0, 3).map((model) => model.name);
  return pageMetadata({
    title: `Used ${make.name} for Sale in Paterson, NJ`,
    description: `Browse ${make.count} used ${make.name} vehicles in stock at Speedway Motors in Paterson, NJ${
      models.length ? `, including the ${models.join(", ")}` : ""
    }. See photos, mileage, and pricing, and apply for financing online.`,
    path: makePagePath(make.slug),
    images: vehicles[0]?.images[0]?.url ? [{ url: vehicles[0].images[0].url, alt: `Used ${make.name} at Speedway Motors` }] : undefined,
  });
}

export default async function MakePage({ params }: PageProps) {
  const { make: slug } = await params;
  const data = await loadMakePage(slug);
  if (!data) notFound();

  const { make, vehicles, others } = data;
  const models = topModels(vehicles);
  const path = makePagePath(make.slug);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Inventory", url: "/inventory" },
          { name: `Used ${make.name}`, url: path },
        ]}
      />
      <InventoryListJsonLd vehicles={vehicles} name={`Used ${make.name} vehicles for sale at ${BUSINESS.shortName}`} path={path} />

      <PageHero
        eyebrow={`Used ${make.name} Inventory`}
        title={`Used ${make.name} for Sale in Paterson, NJ`}
        subtitle={`${make.count} pre-owned ${make.name} ${make.count === 1 ? "vehicle" : "vehicles"} in stock now at ${BUSINESS.shortName}.`}
        compact
      >
        <nav aria-label="Breadcrumb">
          <Link href="/inventory" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            All inventory
          </Link>
        </nav>
      </PageHero>

      <div className="bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 py-8 md:py-12">
          {models.length > 1 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-zinc-300 mb-3">{make.name} models in stock</h2>
              <ul className="flex flex-wrap gap-2">
                {models.map((model) => (
                  <li key={model.name}>
                    <Link
                      href={{ pathname: "/inventory", query: { make: make.name, model: model.name } }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/3 px-3.5 py-1.5 text-sm text-zinc-300 hover:border-white/20 hover:text-white transition-colors"
                    >
                      {make.name} {model.name}
                      <span className="text-xs text-zinc-500">({model.count})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <h2 className="sr-only">Available {make.name} vehicles</h2>
          <InventoryGrid vehicles={vehicles} />

          {make.count > vehicles.length && (
            <div className="mt-8 text-center">
              <Button href={`/inventory?make=${encodeURIComponent(make.name)}`} variant="outline">
                View all {make.count} {make.name} vehicles
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          )}

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/finance" className="rounded-xl border border-white/8 bg-surface-1 p-5 hover:bg-surface-2 transition-colors">
              <p className="font-semibold text-white">Get pre-approved</p>
              <p className="text-sm text-zinc-400 mt-1">Apply online for financing on a used {make.name}.</p>
            </Link>
            <Link href="/trade" className="rounded-xl border border-white/8 bg-surface-1 p-5 hover:bg-surface-2 transition-colors">
              <p className="font-semibold text-white">Value your trade</p>
              <p className="text-sm text-zinc-400 mt-1">Put your current vehicle toward your next one.</p>
            </Link>
            {dealerConfig.features.nationwideShipping ? (
              <Link
                href="/nationwide-car-shipping"
                className="rounded-xl border border-white/8 bg-surface-1 p-5 hover:bg-surface-2 transition-colors"
              >
                <p className="font-semibold text-white">Buying from out of state?</p>
                <p className="text-sm text-zinc-400 mt-1">Ask our team about nationwide vehicle shipping options.</p>
              </Link>
            ) : (
              <Link href="/contact" className="rounded-xl border border-white/8 bg-surface-1 p-5 hover:bg-surface-2 transition-colors">
                <p className="font-semibold text-white">Questions?</p>
                <p className="text-sm text-zinc-400 mt-1">Contact our team about any vehicle.</p>
              </Link>
            )}
          </div>

          {others.length > 0 && (
            <nav aria-labelledby="other-makes" className="mt-14 border-t border-white/6 pt-8">
              <h2 id="other-makes" className="text-lg font-semibold text-white mb-4">Shop Other Makes</h2>
              <ul className="flex flex-wrap gap-2">
                {others.map((other) => (
                  <li key={other.slug}>
                    <Link
                      href={makePagePath(other.slug)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/3 px-3.5 py-1.5 text-sm text-zinc-300 hover:border-white/20 hover:text-white transition-colors"
                    >
                      Used {other.name}
                      <span className="text-xs text-zinc-500">({other.count})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>
    </>
  );
}
