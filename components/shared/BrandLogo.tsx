import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  subtextClassName?: string;
  showSubtext?: boolean;
}

export function BrandLogo({
  className,
  iconClassName,
  textClassName,
  subtextClassName,
  showSubtext = true,
}: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <svg
        className={cn("h-10 w-10", iconClassName)}
        viewBox="0 0 48 48"
        aria-hidden="true"
        role="img"
      >
        <defs>
          <linearGradient id="speedway-s-gradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#ff3a40" />
            <stop offset="100%" stopColor="#D31119" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="44" height="44" rx="10" fill="url(#speedway-s-gradient)" />
        <path
          d="M35.5 13.5h-14c-4.2 0-7.5 2.9-7.5 6.5s3.3 6.5 7.5 6.5h5c1.9 0 3.5 1.3 3.5 3s-1.6 3-3.5 3H12.7v4h13.8c4.2 0 7.5-2.9 7.5-6.5s-3.3-6.5-7.5-6.5h-5c-1.9 0-3.5-1.3-3.5-3s1.6-3 3.5-3h14v-4Z"
          fill="#fff"
        />
      </svg>

      <span className="leading-none">
        <span className={cn("block text-lg font-bold tracking-tight text-white", textClassName)}>
          Speedway Motors
        </span>
        {showSubtext ? (
          <span
            className={cn(
              "mt-1 block text-[9px] font-semibold uppercase tracking-[0.22em] text-zinc-500",
              subtextClassName
            )}
          >
            Premium Used Vehicles
          </span>
        ) : null}
      </span>
    </span>
  );
}
