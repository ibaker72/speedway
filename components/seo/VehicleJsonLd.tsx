import type { Vehicle } from "@/lib/types/vehicle";

export function VehicleJsonLd({ vehicle }: { vehicle: Vehicle }) {
  const jsonLd = {"@context":"https://schema.org","@type":"Car",name:`${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim || ""}`.trim(),brand:{"@type":"Brand",name:vehicle.make},model:vehicle.model,vehicleModelDate:String(vehicle.year),mileageFromOdometer:{"@type":"QuantitativeValue",value:vehicle.mileage,unitCode:"SMI"},color:vehicle.exteriorColor,vehicleTransmission:vehicle.transmission,driveWheelConfiguration:vehicle.drivetrain,fuelType:vehicle.fuelType,vehicleIdentificationNumber:vehicle.vin,offers:{"@type":"Offer",price:vehicle.price,priceCurrency:"USD",availability:vehicle.isSold?"https://schema.org/SoldOut":"https://schema.org/InStock",seller:{"@type":"AutoDealer",name:"Speedway Motors LLC",address:{"@type":"PostalAddress",streetAddress:"302-304 22nd Ave",addressLocality:"Paterson",addressRegion:"NJ",postalCode:"07513"}}},image:vehicle.images[0]?.url||undefined};
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
