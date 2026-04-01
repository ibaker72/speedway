import type { Vehicle } from "@/lib/types/vehicle";

export function VehicleJsonLd({ vehicle }: { vehicle: Vehicle }) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim || ""}`.trim(),
    brand: { "@type": "Brand", name: vehicle.make },
    model: vehicle.model,
    vehicleModelDate: String(vehicle.year),
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: vehicle.mileage,
      unitCode: "SMI",
    },
    vehicleIdentificationNumber: vehicle.vin,
    offers: {
      "@type": "Offer",
      price: vehicle.price,
      priceCurrency: "USD",
      availability: vehicle.isSold
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      seller: {
        "@type": "AutoDealer",
        name: "Speedway Motors LLC",
        address: {
          "@type": "PostalAddress",
          streetAddress: "302-304 22nd Ave",
          addressLocality: "Paterson",
          addressRegion: "NJ",
          postalCode: "07513",
        },
      },
    },
  };

  if (vehicle.bodyType) jsonLd.bodyType = vehicle.bodyType;
  if (vehicle.exteriorColor) jsonLd.color = vehicle.exteriorColor;
  if (vehicle.transmission) jsonLd.vehicleTransmission = vehicle.transmission;
  if (vehicle.drivetrain) jsonLd.driveWheelConfiguration = vehicle.drivetrain;
  if (vehicle.fuelType) jsonLd.fuelType = vehicle.fuelType;
  if (vehicle.engine) {
    jsonLd.vehicleEngine = {
      "@type": "EngineSpecification",
      name: vehicle.engine,
      fuelType: vehicle.fuelType,
    };
  }
  if (vehicle.images[0]?.url) jsonLd.image = vehicle.images[0].url;
  if (vehicle.description) jsonLd.description = vehicle.description;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
