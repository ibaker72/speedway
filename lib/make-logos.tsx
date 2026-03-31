/**
 * Vehicle Make Logo System
 *
 * Provides SVG logos for vehicle manufacturers.
 * Each logo is a monochrome SVG emblem that accepts className for styling.
 * Falls back to styled text when no logo SVG is available.
 *
 * To add a real logo asset later:
 *   1. Place a transparent PNG or SVG in /public/makes/<slug>.svg
 *   2. The MakeLogo component will automatically use it via the image path
 *
 * Current approach: inline SVG emblems for a cohesive, premium monochrome look.
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

/* Inline SVG emblems — distinctive per-brand silhouettes */
function AudiEmblem({ size, className }: { size: number; className?: string }) {
  return (
    <svg viewBox="0 0 120 32" width={size * 2.5} height={size * 0.67} className={className} fill="currentColor" aria-hidden="true">
      <circle cx="20" cy="16" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="38" cy="16" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="56" cy="16" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="74" cy="16" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}

function BMWEmblem({ size, className }: { size: number; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" width={size * 1.1} height={size * 1.1} className={className} fill="currentColor" aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <line x1="20" y1="2" x2="20" y2="38" stroke="currentColor" strokeWidth="1.5" />
      <line x1="2" y1="20" x2="38" y2="20" stroke="currentColor" strokeWidth="1.5" />
      <text x="20" y="46" textAnchor="middle" fontSize="8" fontWeight="700" letterSpacing="1" fill="currentColor" style={{ fontFamily: "inherit" }}>BMW</text>
    </svg>
  );
}

function MercedesEmblem({ size, className }: { size: number; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" width={size * 1.1} height={size * 1.1} className={className} fill="currentColor" aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <line x1="20" y1="2" x2="20" y2="20" stroke="currentColor" strokeWidth="2" />
      <line x1="20" y1="20" x2="4.4" y2="29" stroke="currentColor" strokeWidth="2" />
      <line x1="20" y1="20" x2="35.6" y2="29" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ToyotaEmblem({ size, className }: { size: number; className?: string }) {
  return (
    <svg viewBox="0 0 48 32" width={size * 1.6} height={size * 1.07} className={className} fill="currentColor" aria-hidden="true">
      <ellipse cx="24" cy="16" rx="22" ry="14" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <ellipse cx="24" cy="16" rx="10" ry="14" fill="none" stroke="currentColor" strokeWidth="2" />
      <ellipse cx="24" cy="16" rx="22" ry="6" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function HondaEmblem({ size, className }: { size: number; className?: string }) {
  return (
    <svg viewBox="0 0 40 36" width={size * 1.2} height={size * 1.08} className={className} fill="currentColor" aria-hidden="true">
      <path d="M6 4 L6 32 L13 32 L13 21 L27 21 L27 32 L34 32 L34 4 L27 4 L27 15 L13 15 L13 4 Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  );
}

function ChevroletEmblem({ size, className }: { size: number; className?: string }) {
  return (
    <svg viewBox="0 0 48 28" width={size * 1.7} height={size} className={className} fill="currentColor" aria-hidden="true">
      <rect x="2" y="8" width="44" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <rect x="10" y="10.5" width="28" height="7" rx="0.5" fill="currentColor" opacity="0.25" />
    </svg>
  );
}

function FordEmblem({ size, className }: { size: number; className?: string }) {
  return (
    <svg viewBox="0 0 56 22" width={size * 2.2} height={size * 0.85} className={className} fill="currentColor" aria-hidden="true">
      <ellipse cx="28" cy="11" rx="26" ry="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <text x="28" y="15.5" textAnchor="middle" fontSize="13" fontWeight="700" fontStyle="italic" fill="currentColor" style={{ fontFamily: "inherit" }}>Ford</text>
    </svg>
  );
}

function NissanEmblem({ size, className }: { size: number; className?: string }) {
  return (
    <svg viewBox="0 0 48 28" width={size * 1.7} height={size} className={className} fill="currentColor" aria-hidden="true">
      <circle cx="24" cy="14" r="12" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <rect x="4" y="11.5" width="40" height="5" rx="0.5" fill="currentColor" opacity="0.9" />
      <rect x="4" y="11.5" width="40" height="5" rx="0.5" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function VolkswagenEmblem({ size, className }: { size: number; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" width={size * 1.1} height={size * 1.1} className={className} fill="currentColor" aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <text x="20" y="26" textAnchor="middle" fontSize="18" fontWeight="800" fill="currentColor" style={{ fontFamily: "inherit" }}>VW</text>
    </svg>
  );
}

function PorscheEmblem({ size, className }: { size: number; className?: string }) {
  return (
    <svg viewBox="0 0 40 44" width={size * 1} height={size * 1.1} className={className} fill="currentColor" aria-hidden="true">
      <rect x="2" y="2" width="36" height="40" rx="3" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <line x1="20" y1="2" x2="20" y2="42" stroke="currentColor" strokeWidth="1.5" />
      <line x1="2" y1="22" x2="38" y2="22" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="11" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="29" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function HyundaiEmblem({ size, className }: { size: number; className?: string }) {
  return (
    <svg viewBox="0 0 44 36" width={size * 1.4} height={size * 1.15} className={className} fill="currentColor" aria-hidden="true">
      <ellipse cx="22" cy="18" rx="20" ry="16" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <text x="22" y="23" textAnchor="middle" fontSize="16" fontWeight="800" fontStyle="italic" fill="currentColor" style={{ fontFamily: "inherit" }}>H</text>
    </svg>
  );
}

function KiaEmblem({ size, className }: { size: number; className?: string }) {
  return (
    <svg viewBox="0 0 56 20" width={size * 2.2} height={size * 0.78} className={className} fill="currentColor" aria-hidden="true">
      <text x="28" y="16" textAnchor="middle" fontSize="18" fontWeight="700" letterSpacing="4" fill="currentColor" style={{ fontFamily: "inherit" }}>KIA</text>
      <line x1="6" y1="18" x2="50" y2="18" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

const EMBLEM_MAP: Record<string, React.FC<{ size: number; className?: string }>> = {
  audi: AudiEmblem,
  bmw: BMWEmblem,
  "mercedes-benz": MercedesEmblem,
  toyota: ToyotaEmblem,
  honda: HondaEmblem,
  chevrolet: ChevroletEmblem,
  ford: FordEmblem,
  nissan: NissanEmblem,
  volkswagen: VolkswagenEmblem,
  porsche: PorscheEmblem,
  hyundai: HyundaiEmblem,
  kia: KiaEmblem,
};

/**
 * Renders a vehicle make as a premium SVG emblem.
 * Falls back to a styled wordmark when no emblem SVG is available.
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
  const slug = entry?.slug || make.toLowerCase().replace(/\s+/g, "-");

  const EmblemComponent = EMBLEM_MAP[slug];

  if (EmblemComponent) {
    return (
      <span className={cn("inline-flex flex-col items-center gap-1.5", className)} title={displayName}>
        <EmblemComponent size={size} className="opacity-current" />
        <span
          className="text-[9px] font-semibold uppercase tracking-[0.18em] opacity-60 whitespace-nowrap"
          style={{ lineHeight: 1 }}
        >
          {displayName}
        </span>
      </span>
    );
  }

  // Fallback: styled wordmark
  return (
    <span
      className={cn(
        "inline-flex items-center font-bold tracking-[0.15em] uppercase whitespace-nowrap select-none",
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
