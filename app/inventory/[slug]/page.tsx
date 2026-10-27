import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Phone,
  ChevronLeft,
  Search,
  Hash,
  Shield,
  Star,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VehicleImage } from "@/components/shared/VehicleImage";
import { VehicleGallery } from "@/components/shared/VehicleGallery";
import { VehicleJsonLd } from "@/components/seo/VehicleJsonLd";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { VehicleDetailTabs } from "@/components/shared/VehicleDetailTabs";
import { ShareButtons } from "@/components/shared/ShareButtons";
import { TestDriveToggle } from "@/components/shared/TestDriveToggle";
import { RecentlyViewedTracker } from "@/components/shared/RecentlyViewedTracker";
import { PriceDropAlert } from "@/components/shared/PriceDropAlert";
import { BuildMyDealModule } from "@/components/shared/BuildMyDealModule";
import { MakeLogo } from "@/lib/make-logos";
import { VehicleShippingCta } from "@/components/inventory/VehicleShippingCta";
import { dealerConfig } from "@/dealer.config";
import { getVehicleBySlug, getInventory, getMakeSummaries, makeSlug } from "@/lib/data/inventory-source";
import { MIN_VEHICLES_FOR_MAKE_PAGE, makePagePath } from "@/lib/inventory/make-pages";
import { pageMetadata } from "@/lib/seo/metadata";
import { hasPublishedPrice, vehicleName, vehiclePath } from "@/lib/seo/schema";
import { formatPrice, formatMileage } from "@/lib/data/vehicles-full";
import { BUSINESS } from "@/lib/constants";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) {
    return { title: "Vehicle No Longer Available", robots: { index: false, follow: true } };
  }
  const name = vehicleName(vehicle);
  const priceText = hasPublishedPrice(vehicle) ? `priced at ${formatPrice(vehicle.price)}` : "call for price";
  const shippingText = dealerConfig.features.nationwideShipping ? " Ask about nationwide shipping." : "";
  return pageMetadata({
    title: `${name} for Sale`,
    description: `Used ${name} with ${formatMileage(vehicle.mileage)}, ${priceText}, at Speedway Motors in Paterson, NJ. Financing available.${shippingText}`,
    path: vehiclePath(vehicle),
    images: vehicle.images[0]?.url ? [{ url: vehicle.images[0].url, alt: name }] : undefined,
    // Sold vehicles are normally filtered out (404) before reaching here.
    noindex: vehicle.isSold,
  });
}

export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
  // Skip pre-rendering at build time; all slugs are served on-demand via ISR
  // (dynamicParams = true handles unknown slugs without a Supabase call at build)
  return [];
}

function getCarfaxUrl(vin: string) {
  return `https://www.carfax.com/VehicleHistory/p/Report.cfx?vin=${vin}`;
}

function getCarGurusUrl(vin: string) {
  return `https://www.cargurus.com/Cars/link/${vin}`;
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) notFound();

  const [{ vehicles: related }, makes] = await Promise.all([
    getInventory({ bodyType: vehicle.bodyType, perPage: 4 }),
    getMakeSummaries(),
  ]);
  const relatedVehicles = related
    .filter((v) => v.id !== vehicle.id)
    .slice(0, 3);
  const makeSummary = makes.find((make) => make.slug === makeSlug(vehicle.make));
  const makePage = makeSummary && makeSummary.count >= MIN_VEHICLES_FOR_MAKE_PAGE ? makePagePath(makeSummary.slug) : null;
  const fullName = vehicleName(vehicle);
  const showPrice = hasPublishedPrice(vehicle);

  const specs = [
    { iconName: "Gauge", label: "Mileage", value: formatMileage(vehicle.mileage) },
    { iconName: "Settings2", label: "Transmission", value: vehicle.transmission },
    { iconName: "Fuel", label: "Drivetrain", value: vehicle.drivetrain },
    { iconName: "Fuel", label: "Fuel Type", value: vehicle.fuelType },
    { iconName: "Palette", label: "Exterior", value: vehicle.exteriorColor },
    { iconName: "Palette", label: "Interior", value: vehicle.interiorColor },
    { iconName: "Settings2", label: "Engine", value: vehicle.engine },
    { iconName: "Calendar", label: "Year", value: String(vehicle.year) },
  ];

  const vehicleTitle = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

  return (
    <>
      <VehicleJsonLd vehicle={vehicle} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Inventory", url: "/inventory" },
          ...(makePage ? [{ name: `Used ${vehicle.make}`, url: makePage }] : []),
          { name: fullName, url: vehiclePath(vehicle) },
        ]}
      />
      <div className="bg-[#0a0a0a] min-h-screen pt-24">
        {/* Breadcrumb */}
        <div className="border-b border-white/6">
          <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 py-3">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-zinc-500">
              <li className="flex items-center gap-1.5">
                <Link href="/inventory" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Inventory
                </Link>
              </li>
              {makePage && (
                <li className="flex items-center gap-1.5">
                  <span aria-hidden="true">/</span>
                  <Link href={makePage} className="hover:text-white transition-colors">
                    Used {vehicle.make}
                  </Link>
                </li>
              )}
              <li className="flex items-center gap-1.5 min-w-0">
                <span aria-hidden="true">/</span>
                <span aria-current="page" className="text-zinc-400 truncate max-w-[16rem] sm:max-w-md">
                  {vehicleTitle}
                </span>
              </li>
            </ol>
          </nav>
        </div>

        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 py-6 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
            {/* Left: Image + Details */}
            <div className="lg:col-span-3 space-y-6">
              {/* Image gallery */}
              {vehicle.images.length > 1 ? (
                <VehicleGallery
                  images={vehicle.images}
                  vehicleTitle={fullName}
                  isFeatured={vehicle.isFeatured}
                />
              ) : (
                <div className="aspect-16/10 rounded-2xl overflow-hidden relative bg-linear-to-br from-surface-2 via-surface-3 to-surface-1">
                  {(vehicle.thumbnailUrl || vehicle.images[0]?.url) ? (
                    <VehicleImage
                      src={vehicle.thumbnailUrl || vehicle.images[0].url}
                      alt={`${fullName} — exterior photo`}
                      make={vehicle.make}
                      model={vehicle.model}
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                      <MakeLogo make={vehicle.make} size={48} variant="light" />
                      <p className="text-sm text-zinc-500">Photos coming soon — call for details</p>
                    </div>
                  )}
                  {vehicle.isFeatured && (
                    <span className="absolute top-4 left-4 badge-accent">
                      <Star className="h-3.5 w-3.5" />
                      Featured
                    </span>
                  )}
                </div>
              )}

              {/* Tabbed Details Section */}
              <VehicleDetailTabs
                description={vehicle.description}
                specs={specs}
                features={vehicle.features}
              />

              {/* VIN & Stock */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-600 px-1">
                <div className="flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5" />
                  VIN: {vehicle.vin}
                </div>
                <div className="flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5" />
                  Stock #: {vehicle.stockNumber}
                </div>
                <ShareButtons
                  url={`${BUSINESS.website}/inventory/${vehicle.slug}`}
                  title={vehicleTitle}
                />
              </div>
            </div>

            {/* Right: Pricing + Specs sidebar */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-24 space-y-5">
                {/* Pricing card */}
                <div className="rounded-2xl border border-white/8 bg-surface-2 p-6 md:p-7">
                  <h1 className="text-2xl font-bold text-white mb-1">
                    {vehicleTitle}
                    {vehicle.trim && (
                      <>
                        {" "}
                        <span className="block mt-1 text-base font-normal text-zinc-500">{vehicle.trim}</span>
                      </>
                    )}
                  </h1>
                  <p className="text-sm text-zinc-500 mb-5">
                    {formatMileage(vehicle.mileage)}
                    {vehicle.stockNumber ? ` · Stock #${vehicle.stockNumber}` : ""}
                  </p>

                  <div className="mb-6">
                    <div className="text-3xl font-bold text-accent-light">
                      {showPrice ? formatPrice(vehicle.price) : "Call for Price"}
                    </div>
                    {vehicle.msrp && vehicle.msrp > vehicle.price && (
                      <div className="text-sm text-zinc-600 line-through mt-1">
                        MSRP {formatPrice(vehicle.msrp)}
                      </div>
                    )}
                  </div>

                  {showPrice && (
                    <div className="mb-5">
                      <PriceDropAlert slug={vehicle.slug} title={vehicleTitle} price={vehicle.price} />
                    </div>
                  )}

                  <div className="space-y-3 mb-5">
                    <Button
                      href={BUSINESS.phoneHref}
                      variant="primary"
                      size="lg"
                      className="w-full"
                    >
                      <Phone className="h-4 w-4" />
                      Call About This Vehicle
                    </Button>
                    <a
                      href={getCarfaxUrl(vehicle.vin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full rounded-xl border border-white/15 text-white hover:bg-white/6 hover:border-white/25 active:bg-white/8 px-8 py-3.5 text-[15px] font-semibold transition-all duration-300 ease-out hover:-translate-y-0.5"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      View Carfax Report
                      <ExternalLink className="h-3.5 w-3.5 ml-1 opacity-60" />
                    </a>
                    <a
                      href={getCarGurusUrl(vehicle.vin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full rounded-xl border border-white/15 text-white hover:bg-white/6 hover:border-white/25 active:bg-white/8 px-8 py-3.5 text-[15px] font-semibold transition-all duration-300 ease-out hover:-translate-y-0.5"
                    >
                      <Search className="h-4 w-4" />
                      Check on CarGurus
                      <ExternalLink className="h-3.5 w-3.5 ml-1 opacity-60" />
                    </a>
                    <Button
                      href="/finance"
                      variant="outline"
                      size="lg"
                      className="w-full"
                    >
                      Get Pre-Approved
                    </Button>
                  </div>
                  {showPrice && (
                    <Link
                      href={`/calculator?price=${vehicle.price}`}
                      className="flex items-center justify-center gap-2 text-sm text-zinc-400 hover:text-accent-light transition-colors mb-2"
                    >
                      <span aria-hidden="true">💰</span> Try our Payment Calculator
                    </Link>
                  )}
                  <p className="text-xs text-zinc-600 text-center">
                    Call {BUSINESS.phone} for availability
                  </p>
                </div>

                {dealerConfig.features.nationwideShipping && <VehicleShippingCta slug={vehicle.slug} />}

                <BuildMyDealModule
                  vehicle={{
                    id: vehicle.id,
                    slug: vehicle.slug,
                    stockNumber: vehicle.stockNumber,
                    title: vehicleTitle,
                    price: vehicle.price,
                    mileage: vehicle.mileage,
                    imageUrl: vehicle.images[0]?.url,
                  }}
                />

                {/* Trust signals */}
                <div className="rounded-2xl border border-white/6 bg-surface-1 p-5">
                  <div className="space-y-3">
                    {[
                      { icon: Shield, text: "Quality inspected vehicle" },
                      {
                        icon: Star,
                        text: "Financing available for all credit",
                      },
                      { icon: Star, text: `${BUSINESS.stats.googleRating}\u2605 Google rating` },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.text}
                          className="flex items-center gap-3 text-sm text-zinc-400"
                        >
                          <Icon className="h-4 w-4 text-accent-light shrink-0" />
                          {item.text}
                        </div>
                      );
                    })}
                    <a
                      href={getCarfaxUrl(vehicle.vin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-zinc-400 hover:text-accent-light transition-colors"
                    >
                      <ShieldCheck className="h-4 w-4 text-accent-light shrink-0" />
                      Carfax Vehicle History Report
                      <ExternalLink className="h-3 w-3 opacity-50" />
                    </a>
                  </div>
                </div>

                {/* Test Drive */}
                <TestDriveToggle vehicleId={vehicle.id} vehicleTitle={vehicleTitle} />
              </div>
            </div>
          </div>

          {/* Recently Viewed Tracker */}
          <RecentlyViewedTracker
            slug={vehicle.slug}
            year={vehicle.year}
            make={vehicle.make}
            model={vehicle.model}
            price={vehicle.price}
            image={vehicle.images[0]?.url}
          />

          {/* Helpful Resources */}
          <div className="mt-12 border-t border-white/6 pt-8">
            <h2 className="text-lg font-semibold text-white mb-4">Helpful Resources</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link href="/calculator" className="flex items-center gap-3 p-4 rounded-xl border border-white/8 bg-surface-1 text-sm text-zinc-300 hover:bg-surface-2 hover:text-white transition-colors">
                <span>💰</span> Payment Calculator
              </Link>
              <Link href="/finance" className="flex items-center gap-3 p-4 rounded-xl border border-white/8 bg-surface-1 text-sm text-zinc-300 hover:bg-surface-2 hover:text-white transition-colors">
                <span>✅</span> Get Pre-Approved
              </Link>
              <Link href="/guides/car-buying-guide" className="flex items-center gap-3 p-4 rounded-xl border border-white/8 bg-surface-1 text-sm text-zinc-300 hover:bg-surface-2 hover:text-white transition-colors">
                <span>📋</span> Free Buying Guide
              </Link>
            </div>
          </div>

          {/* Related vehicles */}
          {relatedVehicles.length > 0 && (
            <div className="mt-16 md:mt-20">
              <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
                <h2 className="text-2xl font-bold text-white">
                  You May Also Like
                </h2>
                {makePage && (
                  <Link href={makePage} className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-light hover:text-white transition-colors">
                    See all used {vehicle.make} vehicles
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {relatedVehicles.map((rv) => (
                  <Link
                    key={rv.id}
                    href={`/inventory/${rv.slug}`}
                    className="card-vehicle group block"
                  >
                    <div className="aspect-16/10 relative overflow-hidden">
                      <VehicleImage
                        src={rv.images[0]?.url}
                        alt={vehicleName(rv)}
                        make={rv.make}
                        model={rv.model}
                        className="group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm text-white group-hover:text-accent-light transition-colors">
                        {rv.year} {rv.make} {rv.model}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-accent-light">
                          {hasPublishedPrice(rv) ? formatPrice(rv.price) : "Call for Price"}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {formatMileage(rv.mileage)}
                        </span>
                      </div>
                      <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-accent-light">
                        View Details
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
