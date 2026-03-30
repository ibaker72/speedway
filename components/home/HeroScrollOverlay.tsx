"use client";

import { useEffect, useState } from "react";

export function HeroScrollOverlay() {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const newOpacity = Math.min(scrollY / 500, 0.4);
          setOpacity(newOpacity);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="absolute inset-0 bg-black pointer-events-none z-[5] transition-opacity duration-100"
      style={{ opacity }}
    />
  );
}
