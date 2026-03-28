// Re-export from vehicles-full for backward compatibility
export type { Vehicle } from "@/lib/types/vehicle";
export { allVehicles as featuredVehicles, formatPrice, formatMileage } from "./vehicles-full";
