import Link from "next/link";
import { HeroScrollOverlay } from "./HeroScrollOverlay";
import { HeroVeteranBadge } from "./HeroVeteranBadge";

export function HeroSection() {
  return (
    <section className="hero-full-bleed relative min-h-[80vh] w-screen overflow-hidden text-white">
      <video
        className="hero-video absolute left-0 top-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      <div className="hero-video-overlay absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/55 to-black/70" />
      <HeroScrollOverlay />

      <div className="relative z-10 flex min-h-[80vh] w-full items-center justify-center px-6 py-16 text-center sm:px-10">
        <div className="hero-content-stack flex w-full max-w-[900px] flex-col items-center">
          <HeroVeteranBadge />

          <h1 className="hero-stagger-2 mt-6 text-[clamp(2rem,4.6vw,4.2rem)] font-black leading-[0.98] tracking-[-0.02em]">
            Zero Pressure.
            <br />
            Total Transparency.
            <br />
            Exceptional Vehicles.
          </h1>

          <div className="hero-stagger-3 mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
            <Link
              href="/inventory"
              className="w-full rounded-lg bg-accent px-8 py-4 text-center text-sm font-bold uppercase tracking-[0.08em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-light hover:shadow-[0_4px_20px_rgba(211,17,25,0.4)] sm:w-auto"
            >
              BROWSE INVENTORY
            </Link>

            <Link
              href="/finance"
              className="w-full rounded-lg border border-white/20 bg-white/5 px-8 py-4 text-center text-sm font-bold uppercase tracking-[0.08em] text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 sm:w-auto"
            >
              GET PRE-APPROVED
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
