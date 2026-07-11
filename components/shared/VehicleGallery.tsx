"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Star, Camera } from "lucide-react";
import type { VehicleImage as VehicleImageType } from "@/lib/types/vehicle";
import { cn } from "@/lib/utils";

interface VehicleGalleryProps {
  images: VehicleImageType[];
  vehicleTitle: string;
  isFeatured?: boolean;
}

function GalleryPlaceholder({ label, compact = false }: { label?: string; compact?: boolean }) {
  return (
    <div
      data-testid="gallery-image-fallback"
      className="absolute inset-0 bg-gradient-to-br from-surface-2 to-surface-3 flex flex-col items-center justify-center gap-2 text-zinc-600"
    >
      <Camera className={compact ? "h-4 w-4" : "h-8 w-8"} />
      {!compact && label && <div className="text-sm text-zinc-500">{label}</div>}
    </div>
  );
}

export function VehicleGallery({ images, vehicleTitle, isFeatured }: VehicleGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  // Indexes whose image failed to load. onError fires once per <img> and the
  // failed slot renders a placeholder instead of an <img>, so a bad URL can
  // never produce a broken-image icon or an error/retry loop.
  const [failedIndexes, setFailedIndexes] = useState<ReadonlySet<number>>(new Set());

  const markFailed = useCallback((index: number) => {
    setFailedIndexes((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex((index + images.length) % images.length);
    },
    [images.length]
  );

  useEffect(() => {
    if (!lightboxOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") goTo(activeIndex + 1);
      else if (e.key === "ArrowLeft") goTo(activeIndex - 1);
      else if (e.key === "Escape") setLightboxOpen(false);
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxOpen, activeIndex, goTo]);

  // Swipe support for lightbox
  const [touchStart, setTouchStart] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-16/10 rounded-2xl overflow-hidden relative bg-surface-1">
        <GalleryPlaceholder label={vehicleTitle} />
      </div>
    );
  }

  const activeFailed = failedIndexes.has(activeIndex);

  return (
    <>
      {/* Main Image */}
      <div className="space-y-3">
        <div
          className="aspect-16/10 rounded-2xl overflow-hidden relative bg-surface-1 cursor-pointer"
          onClick={() => setLightboxOpen(true)}
        >
          {activeFailed ? (
            <GalleryPlaceholder label={vehicleTitle} />
          ) : (
            <Image
              src={images[activeIndex].url}
              alt={images[activeIndex].alt || vehicleTitle}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              onError={() => markFailed(activeIndex)}
            />
          )}
          {isFeatured && (
            <span className="absolute top-4 left-4 badge-accent">
              <Star className="h-3.5 w-3.5" />
              Featured
            </span>
          )}
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1.5 rounded-lg">
            {activeIndex + 1} / {images.length} photos
          </div>
        </div>

        {/* Thumbnail Strip */}
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200",
                i === activeIndex
                  ? "border-accent ring-1 ring-accent/30"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              {failedIndexes.has(i) ? (
                <GalleryPlaceholder compact />
              ) : (
                <Image
                  src={img.url}
                  alt={img.alt || `${vehicleTitle} photo ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                  onError={() => markFailed(i)}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
          onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            const diff = touchStart - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) {
              goTo(diff > 0 ? activeIndex + 1 : activeIndex - 1);
            }
          }}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 p-2 text-white/70 hover:text-white transition-colors"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goTo(activeIndex - 1);
            }}
            className="absolute left-4 z-10 p-2 text-white/70 hover:text-white transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          <div
            className="relative w-full max-w-5xl max-h-[85vh] aspect-16/10 mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {activeFailed ? (
              <GalleryPlaceholder label={vehicleTitle} />
            ) : (
              <Image
                src={images[activeIndex].url}
                alt={images[activeIndex].alt || vehicleTitle}
                fill
                className="object-contain"
                sizes="100vw"
                onError={() => markFailed(activeIndex)}
              />
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goTo(activeIndex + 1);
            }}
            className="absolute right-4 z-10 p-2 text-white/70 hover:text-white transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="h-8 w-8" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full">
            {activeIndex + 1} / {images.length} photos
          </div>
        </div>
      )}
    </>
  );
}
