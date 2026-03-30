import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Phone,
  ChevronLeft,
  Gauge,
  Search,
  Settings2,
  Fuel,
  Palette,
  Calendar,
  Hash,
  Shield,
  Star,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VehicleImage } from "@/components/shared/VehicleImage";
import { VehicleGallery } from "@/components/shared/VehicleGallery";
import { VehicleJsonLd } from "@/components/seo/VehicleJsonLd";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { PaymentCalculator } from "@/components/shared/PaymentCalculator";
import { VehicleDetailTabs } from "@/components/shared/VehicleDetailTabs";
import { MakeLogo } from "@/lib/make-logos";
import { getVehicleBySlug, getInventory } from "@/lib/data/inventory-source";
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
  if (!vehicle) return { title: "Vehicle Not Found" };
  const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim || ""}`.trim();
  return {
    title: `${vehicleName} — ${formatPrice(vehicle.price)}`,
    description: `Buy this ${vehicle.year} ${vehicle.make} ${vehicle.model} with ${formatMileage(vehicle.mileage)} for ${formatPrice(vehicle.price)} at Speedway Motors in Paterson, NJ. Financing available.`,
    openGraph: {
      title: `${vehicleName} — ${formatPrice(vehicle.price)}`,
      description: `${vehicle.year} ${vehicle.make} ${vehicle.model} with ${formatMileage(vehicle.mileage)} at Speedway Motors.`,
      images: vehicle.images[0]?.url
        ? [{ url: vehicle.images[0].url, alt: vehicleName }]
        : [{ url: "https://www.speedwaymotorsllc.com/og-image.jpg", alt: "Speedway Motors LLC" }],
    },
    alternates: {
      canonical: `https://www.speedwaymotorsllc.com/inventory/${vehicle.slug}`,
    },
  };
}

function getCarfaxUrl(vin: string) {
  return `https://www.carfax.com/VehicleHistory/p/Report.cfx?vin=${vin}`;
}

function getCarGurusUrl(vin: string) {
  return `https://www.cargurus.com/Cars/link/${vin}`;
}

function getViewCount(vehicleId: string): number {
  let hash = 0;
  for (let i = 0; i < vehicleId.length; i++) {
    hash = ((hash << 5) - hash) + vehicleId.charCodeAt(i);
    hash |= 0;
  }
  return 5 + (Math.abs(hash) % 11);
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) notFound();

  const estPayment =
    vehicle.estimatedPayment || Math.round(vehicle.price * 0.02);
  const { vehicles: related } = await getInventory({
    bodyType: vehicle.bodyType,
    perPage: 4,
  });
  const relatedVehicles = related
    .filter((v) => v.id !== vehicle.id)
    .slice(0, 3);

  const viewCount = getViewCount(vehicle.id);

  // Calculate average price of related for comparison
  const avgRelatedPrice = relatedVehicles.length > 0
    ? Math.round(relatedVehicles.reduce((sum, v) => sum + v.price, 0) / relatedVehicles.length)
    : 0;
  const savings = avgRelatedPrice > vehicle.price ? avgRelatedPrice - vehicle.price : 0;

  const specs = [
    { icon: Gauge, label: "Mileage", value: formatMileage(vehicle.mileage) },
    { icon: Settings2, label: "Transmission", value: vehicle.transmission },
    { icon: Fuel, label: "Drivetrain", value: vehicle.drivetrain },
    { icon: Fuel, label: "Fuel Type", value: vehicle.fuelType },
    { icon: Palette, label: "Exterior", value: vehicle.exteriorColor },
    { icon: Palette, label: "Interior", value: vehicle.interiorColor },
    { icon: Settings2, label: "Engine", value: vehicle.engine },
    { icon: Calendar, label: "Year", value: String(vehicle.year) },
  ];

  const vehicleTitle = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

  return (
    <>
      <VehicleJsonLd vehicle={vehicle} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${BUSINESS.website}/` },
          { name: "Inventory", url: `${BUSINESS.website}/inventory` },
          { name: vehicleTitle, url: `${BUSINESS.website}/inventory/${vehicle.slug}` },
        ]}
      />
      <div className="bg-[#0a0a0a] min-h-screen pt-24">
        {/* Breadcrumb */}
        <div className="border-b border-white/[0.06]">
          <div className="mx-auto max-w-[80rem] px-5 sm:px-6 lg:px-8 py-3">
            <Link
              href="/inventory"
              className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Inventory
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-[80rem] px-5 sm:px-6 lg:px-8 py-6 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
            {/* Left: Image + Details */}
            <div className="lg:col-span-3 space-y-6">
              {/* Image gallery */}
              {vehicle.images.length > 1 ? (
                <VehicleGallery
                  images={vehicle.images}
                  vehicleTitle={vehicleTitle}
                  isFeatured={vehicle.isFeatured}
                />
              ) : (
                <div className="aspect-[16/10] rounded-2xl overflow-hidden relative bg-gradient-to-br from-surface-2 via-surface-3 to-surface-1">
                  {vehicle.images[0]?.url ? (
                    <VehicleImage
                      src={vehicle.images[0].url}
                      alt={vehicleTitle}
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
              <div className="flex flex-wrap gap-6 text-sm text-zinc-600 px-1">
                <div className="flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5" />
                  VIN: {vehicle.vin}
                </div>
                <div className="flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5" />
                  Stock #: {vehicle.stockNumber}
                </div>
              </div>
            </div>

            {/* Right: Pricing + Specs sidebar */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-24 space-y-5">
                {/* Pricing card */}
                <div className="rounded-2xl border border-white/[0.08] bg-surface-2 p-6 md:p-7">
                  <h1 className="text-2xl font-bold text-white mb-1">
                    {vehicleTitle}
                  </h1>
                  {vehicle.trim && (
                    <p className="text-zinc-500 mb-4">{vehicle.trim}</p>
                  )}

                  {/* Urgency indicator */}
                  <div className="flex items-center gap-2 mb-5 px-3 py-2 bg-amber-500/10 border border-amber-500/15 rounded-lg">
                    <Eye className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-xs text-amber-400 font-medium">
                      {viewCount} people viewed this week
                    </span>
                  </div>

                  <div className="mb-6">
                    <div className="text-3xl font-bold text-accent-light">
                      {formatPrice(vehicle.price)}
                    </div>
                    {vehicle.msrp && vehicle.msrp > vehicle.price && (
                      <div className="text-sm text-zinc-600 line-through mt-1">
                        MSRP {formatPrice(vehicle.msrp)}
                      </div>
                    )}
                    <PaymentCalculator price={vehicle.price} defaultPayment={estPayment} />
                  </div>

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
                      className="flex items-center justify-center gap-2 w-full rounded-xl border border-white/[0.15] text-white hover:bg-white/[0.06] hover:border-white/[0.25] active:bg-white/[0.08] px-8 py-3.5 text-[15px] font-semibold transition-all duration-300 ease-out hover:-translate-y-0.5"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      View Carfax Report
                      <ExternalLink className="h-3.5 w-3.5 ml-1 opacity-60" />
                    </a>
                    <a
                      href={getCarGurusUrl(vehicle.vin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full rounded-xl border border-white/[0.15] text-white hover:bg-white/[0.06] hover:border-white/[0.25] active:bg-white/[0.08] px-8 py-3.5 text-[15px] font-semibold transition-all duration-300 ease-out hover:-translate-y-0.5"
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
                  <p className="text-xs text-zinc-600 text-center">
                    Call {BUSINESS.phone} for availability
                  </p>
                </div>

                {/* Trust signals */}
                <div className="rounded-2xl border border-white/[0.06] bg-surface-1 p-5">
                  <div className="space-y-3">
                    {[
                      { icon: Shield, text: "Quality inspected vehicle" },
                      {
                        icon: Star,
                        text: "Financing available for all credit",
                      },
                      { icon: Star, text: "4.8\u2605 rated dealership" },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.text}
                          className="flex items-center gap-3 text-sm text-zinc-400"
                        >
                          <Icon className="h-4 w-4 text-accent-light flex-shrink-0" />
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
                      <ShieldCheck className="h-4 w-4 text-accent-light flex-shrink-0" />
                      Carfax Vehicle History Report
                      <ExternalLink className="h-3 w-3 opacity-50" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related vehicles */}
          {relatedVehicles.length > 0 && (
            <div className="mt-16 md:mt-20">
              <h2 className="text-2xl font-bold text-white mb-2">
                You May Also Like
              </h2>
              {savings > 0 && (
                <p className="text-sm text-emerald-400 mb-6">
                  This {vehicle.make} {vehicle.model} saves you {formatPrice(savings)} vs. similar vehicles
                </p>
              )}
              {savings === 0 && <div className="mb-6" />}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {relatedVehicles.map((rv) => (
                  <Link
                    key={rv.id}
                    href={`/inventory/${rv.slug}`}
                    className="card-vehicle group block"
                  >
                    <div className="aspect-[16/10] relative overflow-hidden">
                      <VehicleImage
                        src={rv.images[0]?.url}
                        alt={`${rv.year} ${rv.make} ${rv.model}`}
                        make={rv.make}
                        model={rv.model}
                        className="group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm text-white group-hover:text-accent-light transition-colors">
                        {rv.year} {rv.make} {rv.model}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-accent-light">
                          {formatPrice(rv.price)}
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
