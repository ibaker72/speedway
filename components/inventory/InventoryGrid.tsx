import type { Vehicle } from "@/lib/types/vehicle";
import { VehicleCard } from "@/components/inventory/VehicleCard";

interface InventoryGridProps {
  vehicles: Vehicle[];
}

export function InventoryGrid({ vehicles }: InventoryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5" id="vehicle-grid">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
}
