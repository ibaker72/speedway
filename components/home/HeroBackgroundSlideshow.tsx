"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface HeroBackgroundSlideshowProps {
  images: { url: string; alt: string }[];
  intervalMs?: number;
}

export function HeroBackgroundSlideshow({
  images,
  intervalMs = 7000,
}: HeroBackgroundSlideshowProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [canCycle, setCanCycle] = useState(false);

  useEffect(() => {
    if (images.length <= 1) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = (matches: boolean) => setCanCycle(!matches);
    update(mq.matches);
    const handler = (e: MediaQueryListEvent) => update(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [images.length]);

  useEffect(() => {
    if (!canCycle || images.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % images.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [canCycle, images.length, intervalMs]);

  if (images.length === 0) return null;

  // Render only the first image until we confirm the user accepts motion. This
  // matches SSR output (canCycle=false initially) and avoids loading the rest
  // for reduced-motion visitors.
  const list = canCycle ? images : images.slice(0, 1);
  const safeActive = activeIndex % list.length;

  return (
    <div className="absolute inset-0" aria-hidden="true">
      {list.map((image, i) => (
        <div
          key={image.url}
          className="absolute inset-0 transition-opacity duration-[1500ms] ease-in-out"
          style={{ opacity: i === safeActive ? 1 : 0 }}
        >
          <Image
            src={image.url}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      ))}
    </div>
  );
}
