"use client";
import Image from "next/image";
import { useState } from "react";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface VehicleImageProps {
  src?: string;
  alt: string;
  make?: string;
  model?: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
}

export function VehicleImage({
  src,
  alt,
  make,
  model,
  className,
  fill = true,
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: VehicleImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const showPlaceholder = !src || error;

  if (showPlaceholder) {
    return (
      <div
        className={cn(
          "bg-gradient-to-br from-surface-2 to-surface-3 flex flex-col items-center justify-center text-zinc-600 gap-2",
          className
        )}
      >
        <Camera className="h-8 w-8" />
        {make && <div className="text-lg font-bold text-zinc-500">{make}</div>}
        {model && <div className="text-sm text-zinc-600">{model}</div>}
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br from-surface-2 to-surface-3 animate-[shimmer_1.5s_ease-in-out_infinite]",
            className
          )}
        />
      )}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        className={cn(
          "object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className
        )}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        priority={priority}
        sizes={sizes}
      />
    </>
  );
}
