import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Phone,
  ChevronLeft,
  Gauge,
  Settings2,
  Fuel,
  Palette,
  Calendar,
  Hash,
  Shield,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VehicleImage } from "@/components/shared/VehicleImage";
import { VehicleJsonLd } from "@/components/seo/VehicleJsonLd";
import { getVehicleBySlug, getInventory } from "@/lib/data/inventory-source";
import { formatPrice, formatMileage } from "@/lib/data/vehicles-full";
import { BUSINESS } from "@/lib/constants";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) return { title: "Vehicle Not Found" };
  return {
    title: `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim || ""} — ${formatPrice(vehicle.price)}`,
    description: `Buy this ${vehicle.year} ${vehicle.make} ${vehicle.model} with ${formatMileage(vehicle.mileage)} for ${formatPrice(vehicle.price)} at Speedway Motors in Paterson, NJ. Financing available.`,
  };
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);

  if (!vehicle) notFound();

  const estPayment = vehicle.estimatedPayment || Math.round(vehicle.price * 0.02);

  // Related vehicles: same body type, similar price range
  const { vehicles: related } = await getInventory({
    bodyType: vehicle.bodyType,
    perPage: 4,
  });
  const relatedVehicles = related
    .filter((v) => v.id !== vehicle.id)
    .slice(0, 3);

  const specs = [
    { icon: Gauge, label: "Mileage", value: formatMileage(vehicle.mileage) },
    { icon: Settings2, label: "Transmission", value: vehicle.transmission },
    { icon: Fuel, label: "Drivetrain", value: vehicle.drivetrain },
    { icon: Fuel, label: "Fuel Type", value: vehicle.fuelType },
    {
      icon: Palette,
      label: "Exterior",
      value: vehicle.exteriorColor,
    },
    {
      icon: Palette,
      label: "Interior",
      value: vehicle.interiorColor,
    },
    {
      icon: Settings2,
      label: "Engine",
      value: vehicle.engine,
    },
    {
      icon: Calendar,
      label: "Year",
      value: String(vehicle.year),
    },
  ];

  return (
    <>
      <VehicleJsonLd vehicle={vehicle} />

      <div className="bg-zinc-50">
        {/* Breadcrumb */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/inventory"
            className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Inventory
          </Link>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left: Image gallery */}
            <div className="lg:col-span-3">
              <div className="aspect-[16/10] rounded-xl overflow-hidden relative bg-zinc-100">
                <VehicleImage
                  src={vehicle.images[0]?.url}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  make={vehicle.make}
                  model={vehicle.model}
                  priority
                />
                {vehicle.isFeatured && (
                  <span className="absolute top-4 left-4 bg-amber-800/90 text-amber-100 text-sm font-medium px-3 py-1.5 rounded-lg backdrop-blur-sm flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
                    Featured
                  </span>
                )}
              </div>

              {/* Description */}
              {vehicle.description && (
                <div className="mt-8">
                  <h2 className="text-lg font-display text-zinc-900 mb-3">
                    About This Vehicle
                  </h2>
                  <p className="text-zinc-600 leading-relaxed">
                    {vehicle.description}
                  </p>
                </div>
              )}

              {/* Features */}
              {vehicle.features.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-lg font-display text-zinc-900 mb-3">
                    Features & Equipment
                  </h2>
                  <div className="grid grid-cols-2 gap-2">
                    {vehicle.features.map((f) => (
                      <div
                        key={f}
                        className="flex items-center gap-2 text-sm text-zinc-600"
                      >
                        <Shield className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VIN / Stock */}
              <div className="mt-8 flex flex-wrap gap-6 text-sm text-zinc-500">
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

            {/* Right: Pricing & CTA */}
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <h1 className="text-2xl font-display text-zinc-900 mb-1">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h1>
                  {vehicle.trim && (
                    <p className="text-zinc-500 mb-4">{vehicle.trim}</p>
                  )}

                  <div className="mb-6">
                    <div className="text-3xl font-display text-accent">
                      {formatPrice(vehicle.price)}
                    </div>
                    {vehicle.msrp && vehicle.msrp > vehicle.price && (
                      <div className="text-sm text-zinc-400 line-through mt-1">
                        MSRP {formatPrice(vehicle.msrp)}
                      </div>
                    )}
                    <div className="mt-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 font-medium">
                        Est. ${estPayment}/mo
                      </p>
                      <p className="text-xs text-green-600">
                        Based on 72 months with approved credit
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <Button
                      href={BUSINESS.phoneHref}
                      variant="primary"
                      size="lg"
                      className="w-full"
                    >
                      <Phone className="h-4 w-4" />
                      Call About This Vehicle
                    </Button>
                    <Button
                      href="/finance"
                      variant="outline"
                      size="lg"
                      className="w-full"
                    >
                      Get Pre-Approved
                    </Button>
                  </div>

                  <p className="text-xs text-zinc-400 text-center">
                    Call {BUSINESS.phone} for availability
                  </p>
                </div>

                {/* Key specs */}
                <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
                  <h2 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-4">
                    Key Specs
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {specs.map((spec) => (
                      <div key={spec.label}>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-0.5">
                          <spec.icon className="h-3 w-3" />
                          {spec.label}
                        </div>
                        <div className="text-sm font-medium text-zinc-900">
                          {spec.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related vehicles */}
          {relatedVehicles.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-display text-zinc-900 mb-6">
                Similar Vehicles
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedVehicles.map((rv) => (
                  <Link
                    key={rv.id}
                    href={`/inventory/${rv.slug}`}
                    className="group rounded-xl border border-zinc-200 bg-white overflow-hidden hover:shadow-md transition-all"
                  >
                    <div className="aspect-[16/10] relative">
                      <VehicleImage
                        src={rv.images[0]?.url}
                        alt={`${rv.year} ${rv.make} ${rv.model}`}
                        make={rv.make}
                        model={rv.model}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm text-zinc-900 group-hover:text-red-700 transition-colors">
                        {rv.year} {rv.make} {rv.model}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-display text-accent">
                          {formatPrice(rv.price)}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {formatMileage(rv.mileage)}
                        </span>
                      </div>
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
