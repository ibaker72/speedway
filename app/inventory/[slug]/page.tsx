import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, ChevronRight, Star } from "lucide-react";
import { VehicleGallery } from "@/components/shared/VehicleGallery";
import { VehicleImage } from "@/components/shared/VehicleImage";
import { VehicleJsonLd } from "@/components/seo/VehicleJsonLd";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { ShareButtons } from "@/components/shared/ShareButtons";
import { TestDriveToggle } from "@/components/shared/TestDriveToggle";
import { RecentlyViewedTracker } from "@/components/shared/RecentlyViewedTracker";
import { PriceDropAlert } from "@/components/shared/PriceDropAlert";
import { BuildMyDealModule } from "@/components/shared/BuildMyDealModule";
import { VehicleLeadActions } from "@/components/inventory/vdp/VehicleLeadActions";
import {
  VehicleFinanceShippingSection,
  VehicleOverviewSection,
  VehicleSpecsSection,
} from "@/components/inventory/vdp/VehicleSections";
import { dealerConfig } from "@/dealer.config";
import { getVehicleBySlug, getInventory, getMakeSummaries, makeSlug } from "@/lib/data/inventory-source";
import { dealerDescriptionContext } from "@/lib/descriptions/dealer";
import { MIN_VEHICLES_FOR_MAKE_PAGE, makePagePath } from "@/lib/inventory/make-pages";
import { bodyTypeLabel } from "@/lib/inventory/specs";
import {
  formatMiles,
  hasLinkableVin,
  keySpecRows,
  specRows,
  vehicleEquipment,
  vehicleHeadline,
  vehicleHighlights,
  vehicleImageAlt,
  vehicleOverview,
  vehicleSpecs,
} from "@/lib/inventory/vehicle-display";
import { vehicleMetadata } from "@/lib/seo/vehicle-metadata";
import { hasPublishedPrice, vehicleName, vehiclePath } from "@/lib/seo/schema";
import { formatPrice } from "@/lib/data/vehicles-full";
import { BUSINESS } from "@/lib/constants";
import type { Vehicle } from "@/lib/types/vehicle";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) {
    return { title: "Vehicle No Longer Available", robots: { index: false, follow: true } };
  }
  return vehicleMetadata(vehicle);
}

export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
  // Skip pre-rendering at build time; all slugs are served on-demand via ISR
  // (dynamicParams = true handles unknown slugs without a Supabase call at build)
  return [];
}

/** Same make first, then same body style; never the vehicle itself. */
async function getRelatedVehicles(vehicle: Vehicle, limit = 4): Promise<Vehicle[]> {
  const [sameMake, sameBody] = await Promise.all([
    getInventory({ make: vehicle.make, perPage: limit + 1, sortBy: "date-added" }),
    vehicle.bodyType ? getInventory({ bodyType: vehicle.bodyType, perPage: limit + 1 }) : Promise.resolve({ vehicles: [] as Vehicle[] }),
  ]);
  const seen = new Set([vehicle.id]);
  const related: Vehicle[] = [];
  for (const candidate of [...sameMake.vehicles, ...sameBody.vehicles]) {
    if (seen.has(candidate.id)) continue;
    seen.add(candidate.id);
    related.push(candidate);
    if (related.length === limit) break;
  }
  return related;
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  // Resolved before anything can stream, so a sold/removed vehicle gets a real 404.
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) notFound();

  const [related, makes] = await Promise.all([getRelatedVehicles(vehicle), getMakeSummaries()]);
  const makeSummary = makes.find((make) => make.slug === makeSlug(vehicle.make));
  const makePage = makeSummary && makeSummary.count >= MIN_VEHICLES_FOR_MAKE_PAGE ? makePagePath(makeSummary.slug) : null;

  const specs = vehicleSpecs(vehicle);
  const { title, trim } = vehicleHeadline(vehicle);
  const fullName = [title, trim].filter(Boolean).join(" ");
  const showPrice = hasPublishedPrice(vehicle);
  const shippingEnabled = dealerConfig.features.nationwideShipping;
  const overview = vehicleOverview(vehicle, specs, dealerDescriptionContext());
  const keySpecs = keySpecRows(vehicle, specs);
  const alts = vehicle.images.map((_, i) => vehicleImageAlt(vehicle, specs, i, vehicle.images.length));
  const meta = [specs.mileage ? formatMiles(specs.mileage) : null, specs.stockNumber ? `Stock #${specs.stockNumber}` : null].filter(Boolean);

  return (
    <>
      <VehicleJsonLd vehicle={vehicle} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Inventory", url: "/inventory" },
          ...(makePage ? [{ name: `Used ${vehicle.make}`, url: makePage }] : []),
          { name: vehicleName(vehicle), url: vehiclePath(vehicle) },
        ]}
      />
      <div className="bg-[#0a0a0a] min-h-screen pt-16 lg:pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10 lg:pb-16">
          {/* 1. Breadcrumb */}
          <nav aria-label="Breadcrumb" className="pt-3 lg:pt-5" data-section="breadcrumb">
            <ol className="flex items-center gap-1 overflow-hidden whitespace-nowrap text-xs sm:text-sm text-zinc-500">
              <li className="shrink-0">
                <Link href="/" className="hover:text-white">Home</Link>
              </li>
              <li className="flex shrink-0 items-center gap-1">
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                <Link href="/inventory" className="hover:text-white">Inventory</Link>
              </li>
              {makePage && (
                <li className="flex shrink-0 items-center gap-1">
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                  <Link href={makePage} className="hover:text-white">Used {vehicle.make}</Link>
                </li>
              )}
              <li className="flex min-w-0 items-center gap-1">
                <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span aria-current="page" className="truncate text-zinc-400">{title}</span>
              </li>
            </ol>
          </nav>

          {/* 2. Title */}
          <header className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1 pt-2 pb-3 lg:pt-3 lg:pb-5" data-section="title">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
                {title}
                {trim && <span className="mt-0.5 block text-base font-medium text-zinc-400 sm:text-lg">{trim}</span>}
              </h1>
              {meta.length > 0 && <p className="mt-1 text-sm text-zinc-500">{meta.join(" · ")}</p>}
            </div>
            <div className="hidden sm:block">
              <ShareButtons url={`${BUSINESS.website}/inventory/${vehicle.slug}`} title={fullName} />
            </div>
          </header>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-x-8 lg:gap-y-6">
            {/* 3. Gallery */}
            <div className="lg:col-start-1 lg:row-start-1" data-section="gallery">
              <VehicleGallery images={vehicle.images} vehicleTitle={fullName} isFeatured={vehicle.isFeatured} alts={alts} />
            </div>

            {/* 4–5. Price, key specs, primary actions */}
            <aside
              aria-label="Price and contact options"
              className="lg:col-start-2 lg:row-start-1 lg:row-span-3 lg:self-start lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto"
              data-section="summary"
            >
              <div className="rounded-2xl border border-white/8 bg-surface-2 p-4 sm:p-5">
                <div data-section="price" className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className="text-3xl font-bold text-accent-light">
                    <span className="sr-only">Price: </span>
                    {showPrice ? formatPrice(vehicle.price) : "Call for Price"}
                  </p>
                  {showPrice && vehicle.msrp && vehicle.msrp > vehicle.price && (
                    <p className="text-sm text-zinc-500 line-through">MSRP {formatPrice(vehicle.msrp)}</p>
                  )}
                </div>
                {!showPrice && (
                  <p className="mt-1 text-sm text-zinc-400">
                    Call <a href={BUSINESS.phoneHref} className="text-accent-light">{BUSINESS.phone}</a> or check availability for pricing.
                  </p>
                )}

                {keySpecs.length > 0 && (
                  <dl className="mt-3 grid grid-cols-2 gap-2" data-section="key-specs">
                    {keySpecs.map((spec) => (
                      <div key={spec.key} className="rounded-lg bg-white/4 px-3 py-2">
                        <dt className="text-[11px] uppercase tracking-wide text-zinc-500">{spec.label}</dt>
                        <dd className="truncate text-sm font-medium text-white" title={spec.value}>{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                <div className="mt-4" data-section="actions">
                  <VehicleLeadActions
                    vehicle={{ slug: vehicle.slug, title: fullName }}
                    phone={BUSINESS.phone}
                    phoneHref={BUSINESS.phoneHref}
                    shippingEnabled={shippingEnabled}
                  />
                </div>

                {showPrice && (
                  <div className="mt-4">
                    <PriceDropAlert slug={vehicle.slug} title={title} price={vehicle.price} />
                  </div>
                )}
                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-zinc-500">
                  <Star className="h-3.5 w-3.5 text-accent-light" aria-hidden="true" />
                  {BUSINESS.stats.googleRating}★ Google rating · {dealerConfig.locations[0].city}, {dealerConfig.locations[0].state}
                </p>
              </div>
            </aside>

            {/* 6. Overview */}
            <div className="lg:col-start-1 lg:row-start-2">
              <VehicleOverviewSection title={fullName} overview={overview} vin={specs.vin} historyLinks={hasLinkableVin(specs)} />
            </div>

            {/* 7. Features & specifications */}
            <div className="lg:col-start-1 lg:row-start-3">
              <VehicleSpecsSection rows={specRows(vehicle, specs)} highlights={vehicleHighlights(vehicle)} equipment={vehicleEquipment(vehicle)} />
            </div>

            {/* 8. Financing & nationwide shipping */}
            <div className="lg:col-start-1 lg:row-start-4">
              <VehicleFinanceShippingSection priceForCalculator={showPrice ? vehicle.price : null} shippingEnabled={shippingEnabled}>
                <div className="grid grid-cols-1 gap-4">
                  {showPrice && (
                    <BuildMyDealModule
                      vehicle={{
                        id: vehicle.id,
                        slug: vehicle.slug,
                        stockNumber: vehicle.stockNumber,
                        title,
                        price: vehicle.price,
                        mileage: vehicle.mileage,
                        imageUrl: vehicle.images[0]?.url,
                      }}
                    />
                  )}
                  <TestDriveToggle vehicleId={vehicle.id} vehicleTitle={fullName} />
                </div>
              </VehicleFinanceShippingSection>
            </div>
          </div>

          <RecentlyViewedTracker
            slug={vehicle.slug}
            year={vehicle.year}
            make={vehicle.make}
            model={vehicle.model}
            price={vehicle.price}
            image={vehicle.images[0]?.url}
          />

          {/* 9. Related vehicles */}
          {related.length > 0 && (
            <section aria-labelledby="vdp-related" className="mt-10 lg:mt-14" data-section="related">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <h2 id="vdp-related" className="text-xl font-bold text-white sm:text-2xl">Similar Vehicles</h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
                  {makePage && (
                    <Link href={makePage} className="inline-flex items-center gap-1.5 text-accent-light hover:text-white">
                      All used {vehicle.make} vehicles
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  )}
                  {specs.bodyType && (
                    <Link href={`/inventory?type=${specs.bodyType}`} className="inline-flex items-center gap-1.5 text-accent-light hover:text-white">
                      More used {bodyTypeLabel(specs.bodyType) === "SUV" ? "SUVs" : `${bodyTypeLabel(specs.bodyType).toLowerCase()}s`}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </div>
              <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
                {related.map((rv) => {
                  const rvSpecs = vehicleSpecs(rv);
                  const rvName = vehicleName(rv);
                  return (
                    <li key={rv.id}>
                      <Link href={vehiclePath(rv)} className="card-vehicle group block h-full">
                        <div className="relative aspect-16/10 overflow-hidden">
                          <VehicleImage
                            src={rv.images[0]?.url}
                            alt={vehicleImageAlt(rv, rvSpecs, 0, 1)}
                            make={rv.make}
                            model={rv.model}
                            className="transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-3 sm:p-4">
                          <h3 className="line-clamp-2 text-sm font-semibold text-white group-hover:text-accent-light">{rvName}</h3>
                          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-2 text-xs">
                            <span className="font-bold text-accent-light">{hasPublishedPrice(rv) ? formatPrice(rv.price) : "Call for Price"}</span>
                            {rvSpecs.mileage && <span className="text-zinc-500">{formatMiles(rvSpecs.mileage)}</span>}
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
