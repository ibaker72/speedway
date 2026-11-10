"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, Star, Camera, Expand } from "lucide-react";
import type { VehicleImage as VehicleImageType } from "@/lib/types/vehicle";
import { cn } from "@/lib/utils";

interface VehicleGalleryProps {
  images: VehicleImageType[];
  vehicleTitle: string;
  isFeatured?: boolean;
  /** Per-photo alt text (computed on the server); falls back to the title + photo number. */
  alts?: string[];
}

function GalleryPlaceholder({ label, compact = false }: { label?: string; compact?: boolean }) {
  return (
    <div
      data-testid="gallery-image-fallback"
      className="absolute inset-0 bg-gradient-to-br from-surface-2 to-surface-3 flex flex-col items-center justify-center gap-2 text-zinc-600"
    >
      <Camera className={compact ? "h-4 w-4" : "h-8 w-8"} aria-hidden="true" />
      {!compact && label && <div className="text-sm text-zinc-500">{label}</div>}
    </div>
  );
}

const SWIPE_THRESHOLD = 50;

export function VehicleGallery({ images, vehicleTitle, isFeatured, alts }: VehicleGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  // Indexes whose image failed to load. onError fires once per <img> and the
  // failed slot renders a placeholder instead of an <img>, so a bad URL can
  // never produce a broken-image icon or an error/retry loop.
  const [failedIndexes, setFailedIndexes] = useState<ReadonlySet<number>>(new Set());
  const touchStart = useRef<number | null>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const total = images.length;
  const altFor = (i: number) => alts?.[i] || images[i]?.alt || `${vehicleTitle} — photo ${i + 1} of ${total}`;

  const markFailed = useCallback((index: number) => {
    setFailedIndexes((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  const goTo = useCallback((index: number) => setActiveIndex((index + total) % total), [total]);

  useEffect(() => {
    thumbRefs.current[activeIndex]?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  }, [activeIndex]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const opener = openerRef.current;
    closeRef.current?.focus();
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
      opener?.focus();
    };
  }, [lightboxOpen, activeIndex, goTo]);

  const swipeHandlers = {
    onTouchStart: (e: React.TouchEvent) => {
      touchStart.current = e.touches[0].clientX;
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (touchStart.current === null || total < 2) return;
      const diff = touchStart.current - e.changedTouches[0].clientX;
      touchStart.current = null;
      if (Math.abs(diff) > SWIPE_THRESHOLD) goTo(diff > 0 ? activeIndex + 1 : activeIndex - 1);
    },
  };

  if (total === 0) {
    return (
      <div className="aspect-16/10 rounded-2xl overflow-hidden relative bg-surface-1">
        <GalleryPlaceholder label="Photos coming soon" />
      </div>
    );
  }

  const activeFailed = failedIndexes.has(activeIndex);
  const arrow =
    "absolute top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/75";

  return (
    <>
      <div className="space-y-2" aria-roledescription="carousel" aria-label={`${vehicleTitle} photos`}>
        <div className="aspect-16/10 rounded-2xl overflow-hidden relative bg-surface-1" {...swipeHandlers}>
          {activeFailed ? (
            <GalleryPlaceholder label={vehicleTitle} />
          ) : (
            <Image
              src={images[activeIndex].url}
              alt={altFor(activeIndex)}
              fill
              className="object-cover"
              priority={activeIndex === 0}
              sizes="(max-width: 1024px) 100vw, 60vw"
              onError={() => markFailed(activeIndex)}
            />
          )}
          <button
            ref={openerRef}
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="absolute inset-0 cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-accent"
            aria-label={`View photo ${activeIndex + 1} of ${total} full screen`}
          />
          {isFeatured && (
            <span className="absolute top-3 left-3 badge-accent pointer-events-none">
              <Star className="h-3.5 w-3.5" aria-hidden="true" />
              Featured
            </span>
          )}
          {total > 1 && (
            <>
              <button type="button" onClick={() => goTo(activeIndex - 1)} className={cn(arrow, "left-2")} aria-label="Previous photo">
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => goTo(activeIndex + 1)} className={cn(arrow, "right-2")} aria-label="Next photo">
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </>
          )}
          <div className="pointer-events-none absolute bottom-2.5 right-2.5 flex items-center gap-1.5 rounded-lg bg-black/60 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur-sm" aria-live="polite">
            <Expand className="h-3 w-3" aria-hidden="true" />
            {activeIndex + 1} / {total} photos
          </div>
        </div>

        {total > 1 && (
          <ul className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Photo thumbnails">
            {images.map((img, i) => (
              <li key={i} className="shrink-0">
                <button
                  ref={(el) => {
                    thumbRefs.current[i] = el;
                  }}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-current={i === activeIndex ? "true" : undefined}
                  className={cn(
                    "relative block h-11 w-16 sm:h-14 sm:w-20 rounded-lg overflow-hidden border-2 transition-all duration-200",
                    i === activeIndex ? "border-accent ring-1 ring-accent/30" : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  {failedIndexes.has(i) ? (
                    <GalleryPlaceholder compact />
                  ) : (
                    <Image src={img.url} alt="" fill className="object-cover" sizes="80px" onError={() => markFailed(i)} />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${vehicleTitle} — photo ${activeIndex + 1} of ${total}`}
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
          {...swipeHandlers}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 p-2 text-white/70 hover:text-white transition-colors"
            aria-label="Close full-screen photos"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
          {total > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goTo(activeIndex - 1);
              }}
              className="absolute left-2 sm:left-4 z-10 p-2 text-white/70 hover:text-white transition-colors"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-8 w-8" aria-hidden="true" />
            </button>
          )}
          <div className="relative w-full max-w-5xl max-h-[85vh] aspect-16/10 mx-4" onClick={(e) => e.stopPropagation()}>
            {activeFailed ? (
              <GalleryPlaceholder label={vehicleTitle} />
            ) : (
              <Image
                src={images[activeIndex].url}
                alt={altFor(activeIndex)}
                fill
                className="object-contain"
                sizes="100vw"
                onError={() => markFailed(activeIndex)}
              />
            )}
          </div>
          {total > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goTo(activeIndex + 1);
              }}
              className="absolute right-2 sm:right-4 z-10 p-2 text-white/70 hover:text-white transition-colors"
              aria-label="Next photo"
            >
              <ChevronRight className="h-8 w-8" aria-hidden="true" />
            </button>
          )}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full">
            {activeIndex + 1} / {total} photos
          </div>
        </div>
      )}
    </>
  );
}
