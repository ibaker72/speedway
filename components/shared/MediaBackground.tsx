"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface MediaBackgroundProps {
  /** Path to background image (from /public) */
  imageSrc?: string;
  /** Alt text for accessibility */
  imageAlt?: string;
  /** Overlay style */
  overlay?: "dark" | "darker" | "gradient" | "gradient-left" | "none";
  /** Enable subtle Ken Burns drift animation */
  animate?: boolean;
  /** Blur amount in px (0 = none) */
  blur?: number;
  /** Additional className for the container */
  className?: string;
  children: React.ReactNode;
}

const overlayStyles = {
  dark: "bg-black/60",
  darker: "bg-black/75",
  gradient: "bg-gradient-to-b from-black/70 via-black/50 to-black/80",
  "gradient-left": "bg-gradient-to-r from-black/80 via-black/50 to-transparent",
  none: "",
};

/**
 * Reusable section background component.
 * Supports image backgrounds with overlays, blur, and subtle animation.
 * Designed for hero sections, prestige mid-page sections, and location sections.
 *
 * Usage:
 *   <MediaBackground imageSrc="/dealership/showroom.jpg" overlay="gradient">
 *     <YourContent />
 *   </MediaBackground>
 */
export function MediaBackground({
  imageSrc,
  imageAlt = "",
  overlay = "dark",
  animate = false,
  blur = 0,
  className,
  children,
}: MediaBackgroundProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Background image */}
      {imageSrc && (
        <div
          className={cn(
            "absolute inset-0",
            animate && "animate-[subtleDrift_30s_ease-in-out_infinite]"
          )}
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className={cn(
              "object-cover",
              blur > 0 && `blur-[${blur}px]`
            )}
            priority
            sizes="100vw"
            style={blur > 0 ? { filter: `blur(${blur}px)`, transform: "scale(1.05)" } : undefined}
          />
        </div>
      )}

      {/* Overlay */}
      {overlay !== "none" && (
        <div className={cn("absolute inset-0", overlayStyles[overlay])} />
      )}

      {/* Grain texture */}
      <div className="grain-overlay absolute inset-0 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
