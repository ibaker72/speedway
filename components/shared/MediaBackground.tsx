import Image from "next/image";
import { cn } from "@/lib/utils";

interface MediaBackgroundProps {
  imageSrc?: string;
  imageAlt?: string;
  overlay?: "dark" | "darker" | "gradient" | "gradient-left" | "none";
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

export function MediaBackground({
  imageSrc,
  imageAlt = "",
  overlay = "dark",
  className,
  children,
}: MediaBackgroundProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {imageSrc && (
        <div className="absolute inset-0">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
      )}

      {overlay !== "none" && (
        <div className={cn("absolute inset-0", overlayStyles[overlay])} />
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}
