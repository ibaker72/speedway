"use client";

import { useState } from "react";

export function HeroVideo() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className="h-full w-full motion-reduce:hidden"
        style={{
          background:
            "radial-gradient(circle at 18% 30%, rgba(211,17,25,0.22) 0%, rgba(10,10,10,0.82) 40%, #050505 100%)",
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <video
      className="h-full w-full object-cover object-center motion-reduce:hidden"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      onError={() => setFailed(true)}
    >
      <source src="/videos/hero.mp4" type="video/mp4" />
    </video>
  );
}
