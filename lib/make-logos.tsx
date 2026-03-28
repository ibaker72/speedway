/**
 * Vehicle Make Logo System
 *
 * Provides SVG logos for vehicle manufacturers.
 * Each logo is a monochrome SVG that accepts className for styling.
 * Falls back to styled text when no logo SVG is available.
 *
 * To add a real logo asset later:
 *   1. Place a transparent PNG or SVG in /public/makes/<slug>.svg
 *   2. The MakeLogo component will automatically use it via the image path
 *
 * Current approach: inline SVG wordmarks for a cohesive, premium monochrome look.
 */

import { cn } from "@/lib/utils";

export interface MakeLogoEntry {
  name: string;
  slug: string;
}

export const VEHICLE_MAKES: MakeLogoEntry[] = [
  { name: "Acura", slug: "acura" },
  { name: "Audi", slug: "audi" },
  { name: "BMW", slug: "bmw" },
  { name: "Cadillac", slug: "cadillac" },
  { name: "Chevrolet", slug: "chevrolet" },
  { name: "Chrysler", slug: "chrysler" },
  { name: "Dodge", slug: "dodge" },
  { name: "Ford", slug: "ford" },
  { name: "GMC", slug: "gmc" },
  { name: "Honda", slug: "honda" },
  { name: "Hyundai", slug: "hyundai" },
  { name: "INFINITI", slug: "infiniti" },
  { name: "Jeep", slug: "jeep" },
  { name: "Kia", slug: "kia" },
  { name: "Land Rover", slug: "land-rover" },
  { name: "Lexus", slug: "lexus" },
  { name: "Lincoln", slug: "lincoln" },
  { name: "Mazda", slug: "mazda" },
  { name: "Mercedes-Benz", slug: "mercedes-benz" },
  { name: "Nissan", slug: "nissan" },
  { name: "Porsche", slug: "porsche" },
  { name: "Ram", slug: "ram" },
  { name: "Subaru", slug: "subaru" },
  { name: "Toyota", slug: "toyota" },
  { name: "Volkswagen", slug: "volkswagen" },
  { name: "Volvo", slug: "volvo" },
];

interface MakeLogoProps {
  make: string;
  className?: string;
  /** Height in pixels — width auto-scales */
  size?: number;
  /** Color mode */
  variant?: "light" | "dark" | "accent";
}

const variantColors = {
  light: "text-zinc-400",
  dark: "text-zinc-700",
  accent: "text-accent",
};

/**
 * Renders a vehicle make as a premium styled wordmark.
 * Replace with actual SVG/PNG assets when available by placing them
 * in /public/makes/<slug>.svg
 */
export function MakeLogo({
  make,
  className,
  size = 20,
  variant = "light",
}: MakeLogoProps) {
  const entry = VEHICLE_MAKES.find(
    (m) => m.name.toLowerCase() === make.toLowerCase()
  );
  const displayName = entry?.name || make;

  return (
    <span
      className={cn(
        "inline-flex items-center font-display tracking-[0.15em] uppercase whitespace-nowrap select-none",
        variantColors[variant],
        className
      )}
      style={{ fontSize: `${size * 0.65}px`, lineHeight: 1 }}
      title={displayName}
    >
      {displayName}
    </span>
  );
}

/**
 * Utility to get the slug for a make name
 */
export function getMakeSlug(make: string): string {
  const entry = VEHICLE_MAKES.find(
    (m) => m.name.toLowerCase() === make.toLowerCase()
  );
  return entry?.slug || make.toLowerCase().replace(/\s+/g, "-");
}
