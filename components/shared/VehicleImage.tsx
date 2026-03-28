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
}

export function VehicleImage({ src, alt, make, model, className, fill = true, priority = false }: VehicleImageProps) {
  const [error, setError] = useState(false);
  const showPlaceholder = !src || error;

  if (showPlaceholder) {
    return (
      <div className={cn("bg-gradient-to-br from-zinc-100 to-zinc-200 flex flex-col items-center justify-center text-zinc-400 gap-2", className)}>
        <Camera className="h-8 w-8" />
        {make && <div className="text-lg font-bold">{make}</div>}
        {model && <div className="text-sm">{model}</div>}
      </div>
    );
  }

  return (
    <Image src={src} alt={alt} fill={fill} className={cn("object-cover", className)} onError={() => setError(true)} priority={priority} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
  );
}
