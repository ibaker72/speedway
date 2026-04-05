"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { VehicleImage } from "@/components/shared/VehicleImage";
import { Clock } from "lucide-react";

interface RecentVehicle {
  slug: string;
  year: number;
  make: string;
  model: string;
  price: number;
  image?: string;
}

const STORAGE_KEY = "speedway-recently-viewed";
const MAX_ITEMS = 6;

export function saveRecentlyViewed(vehicle: RecentVehicle) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let items: RecentVehicle[] = stored ? JSON.parse(stored) : [];
    items = items.filter((v) => v.slug !== vehicle.slug);
    items.unshift(vehicle);
    items = items.slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

function getSnapshot(): RecentVehicle[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function getServerSnapshot(): RecentVehicle[] {
  return [];
}

let cachedVehicles: RecentVehicle[] = [];

function getStableSnapshot(): RecentVehicle[] {
  const next = getSnapshot();
  if (JSON.stringify(next) !== JSON.stringify(cachedVehicles)) {
    cachedVehicles = next;
  }
  return cachedVehicles;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function RecentlyViewed() {
  const vehicles = useSyncExternalStore(subscribe, getStableSnapshot, getServerSnapshot);

  if (vehicles.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="flex items-center gap-2 mb-5">
        <Clock className="h-4 w-4 text-zinc-500" />
        <h2 className="text-lg font-bold text-white">Recently Viewed</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {vehicles.map((v) => (
          <Link
            key={v.slug}
            href={`/inventory/${v.slug}`}
            className="shrink-0 w-52 card-vehicle group block"
          >
            <div className="aspect-16/10 relative overflow-hidden">
              <VehicleImage
                src={v.image}
                alt={`${v.year} ${v.make} ${v.model}`}
                make={v.make}
                model={v.model}
                className="group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-3">
              <p className="text-xs font-semibold text-white group-hover:text-accent-light transition-colors truncate">
                {v.year} {v.make} {v.model}
              </p>
              <p className="text-xs text-accent-light font-bold mt-1">
                ${v.price.toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
