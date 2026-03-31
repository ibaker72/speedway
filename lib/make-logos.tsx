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
  size?: number;
  variant?: "light" | "dark" | "accent";
  mode?: "wordmark" | "emblem";
}

const variantColors = {
  light: "text-zinc-300",
  dark: "text-zinc-700",
  accent: "text-accent",
};

const emblemGlyphs: Record<string, string> = {
  audi: "A",
  bmw: "B",
  "mercedes-benz": "M",
  ford: "F",
  toyota: "T",
  honda: "H",
  chevrolet: "C",
  nissan: "N",
  volkswagen: "V",
  porsche: "P",
  hyundai: "H",
  kia: "K",
};

function Emblem({ glyph, make, size = 30, className }: { glyph: string; make: string; size?: number; className?: string }) {
  const stroke = Math.max(1.8, size * 0.07);
  return (
    <svg
      viewBox="0 0 100 100"
      width={size * 1.58}
      height={size}
      aria-label={make}
      role="img"
      className={cn("transition-all duration-300", className)}
    >
      <ellipse cx="50" cy="50" rx="46" ry="30" fill="none" stroke="currentColor" strokeWidth={stroke} opacity="0.9" />
      <ellipse cx="50" cy="50" rx="39" ry="24" fill="none" stroke="currentColor" strokeWidth={stroke * 0.7} opacity="0.45" />
      <text
        x="50"
        y="56"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="currentColor"
        fontSize="34"
        fontWeight="700"
        letterSpacing="0.12em"
        fontFamily="Inter, system-ui, sans-serif"
      >
        {glyph}
      </text>
    </svg>
  );
}

export function MakeLogo({
  make,
  className,
  size = 20,
  variant = "light",
  mode = "wordmark",
}: MakeLogoProps) {
  const entry = VEHICLE_MAKES.find((m) => m.name.toLowerCase() === make.toLowerCase());
  const slug = entry?.slug || make.toLowerCase().replace(/\s+/g, "-");
  const displayName = entry?.name || make;

  if (mode === "emblem") {
    const glyph = emblemGlyphs[slug] || displayName[0] || "•";
    return (
      <span className={cn("inline-flex items-center", variantColors[variant], className)} title={displayName}>
        <Emblem glyph={glyph} make={displayName} size={size} />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center font-bold tracking-[0.15em] uppercase whitespace-nowrap select-none",
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

export function getMakeSlug(make: string): string {
  const entry = VEHICLE_MAKES.find((m) => m.name.toLowerCase() === make.toLowerCase());
  return entry?.slug || make.toLowerCase().replace(/\s+/g, "-");
}
