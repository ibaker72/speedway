export interface Vehicle {
  slug: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  price: number;
  mileage: number;
  exteriorColor: string;
  interiorColor: string;
  transmission: string;
  drivetrain: string;
  engine: string;
  fuelType: string;
  bodyType: "sedan" | "suv" | "truck" | "van" | "coupe" | "luxury" | "commercial";
  vin: string;
  stockNumber: string;
  images: string[];
  features: string[];
  isCommercial: boolean;
  isFeatured: boolean;
}

export const featuredVehicles: Vehicle[] = [
  {
    slug: "2022-toyota-camry-se",
    year: 2022,
    make: "Toyota",
    model: "Camry",
    trim: "SE",
    price: 24995,
    mileage: 28450,
    exteriorColor: "Midnight Black",
    interiorColor: "Black",
    transmission: "Automatic",
    drivetrain: "FWD",
    engine: "2.5L 4-Cylinder",
    fuelType: "Gasoline",
    bodyType: "sedan",
    vin: "4T1G11AK5NU000001",
    stockNumber: "SM2201",
    images: ["/images/vehicles/camry-placeholder.jpg"],
    features: ["Apple CarPlay", "Lane Departure Warning", "Adaptive Cruise Control", "Backup Camera"],
    isCommercial: false,
    isFeatured: true,
  },
  {
    slug: "2021-honda-cr-v-ex-l",
    year: 2021,
    make: "Honda",
    model: "CR-V",
    trim: "EX-L",
    price: 27990,
    mileage: 34200,
    exteriorColor: "Crystal White Pearl",
    interiorColor: "Gray",
    transmission: "CVT",
    drivetrain: "AWD",
    engine: "1.5L Turbo 4-Cylinder",
    fuelType: "Gasoline",
    bodyType: "suv",
    vin: "7FART6H58ME000002",
    stockNumber: "SM2102",
    images: ["/images/vehicles/crv-placeholder.jpg"],
    features: ["Leather Seats", "Sunroof", "Heated Seats", "Android Auto"],
    isCommercial: false,
    isFeatured: true,
  },
  {
    slug: "2023-ford-f-150-xlt",
    year: 2023,
    make: "Ford",
    model: "F-150",
    trim: "XLT",
    price: 38500,
    mileage: 18300,
    exteriorColor: "Iconic Silver",
    interiorColor: "Medium Dark Slate",
    transmission: "Automatic",
    drivetrain: "4WD",
    engine: "2.7L V6 EcoBoost",
    fuelType: "Gasoline",
    bodyType: "truck",
    vin: "1FTFW1E85NF000003",
    stockNumber: "SM2303",
    images: ["/images/vehicles/f150-placeholder.jpg"],
    features: ["Tow Package", "SYNC 4", "360-Degree Camera", "Spray-In Bedliner"],
    isCommercial: false,
    isFeatured: true,
  },
  {
    slug: "2022-bmw-3-series-330i",
    year: 2022,
    make: "BMW",
    model: "3 Series",
    trim: "330i xDrive",
    price: 36750,
    mileage: 22100,
    exteriorColor: "Alpine White",
    interiorColor: "Black Vernasca Leather",
    transmission: "Automatic",
    drivetrain: "AWD",
    engine: "2.0L Turbo 4-Cylinder",
    fuelType: "Gasoline",
    bodyType: "luxury",
    vin: "3MW5R1J05N8000004",
    stockNumber: "SM2204",
    images: ["/images/vehicles/bmw3-placeholder.jpg"],
    features: ["Navigation", "Heated Steering Wheel", "Parking Assistant", "Harman Kardon Sound"],
    isCommercial: false,
    isFeatured: true,
  },
  {
    slug: "2021-chevrolet-equinox-lt",
    year: 2021,
    make: "Chevrolet",
    model: "Equinox",
    trim: "LT",
    price: 22490,
    mileage: 41200,
    exteriorColor: "Summit White",
    interiorColor: "Jet Black",
    transmission: "Automatic",
    drivetrain: "AWD",
    engine: "1.5L Turbo 4-Cylinder",
    fuelType: "Gasoline",
    bodyType: "suv",
    vin: "2GNAXUEV0M6000005",
    stockNumber: "SM2105",
    images: ["/images/vehicles/equinox-placeholder.jpg"],
    features: ["Remote Start", "WiFi Hotspot", "Rear Park Assist", "Bluetooth"],
    isCommercial: false,
    isFeatured: true,
  },
  {
    slug: "2020-mercedes-benz-c300",
    year: 2020,
    make: "Mercedes-Benz",
    model: "C-Class",
    trim: "C 300 4MATIC",
    price: 31900,
    mileage: 38700,
    exteriorColor: "Obsidian Black",
    interiorColor: "Silk Beige",
    transmission: "Automatic",
    drivetrain: "AWD",
    engine: "2.0L Turbo 4-Cylinder",
    fuelType: "Gasoline",
    bodyType: "luxury",
    vin: "W1KWF8DB5LR000006",
    stockNumber: "SM2006",
    images: ["/images/vehicles/c300-placeholder.jpg"],
    features: ["MBUX Infotainment", "Burmester Sound", "Panoramic Roof", "LED Headlights"],
    isCommercial: false,
    isFeatured: true,
  },
];

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatMileage(mileage: number): string {
  return new Intl.NumberFormat("en-US").format(mileage) + " mi";
}
