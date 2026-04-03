import Link from "next/link";
import { HeroLocationBadge } from "./HeroVeteranBadge";
import { HeroVideo } from "./HeroVideo";

export function HeroSection() {
  return (
    <section className="hero-full-bleed relative isolate w-full overflow-hidden border-b border-white/10 bg-black text-white">
      <div className="absolute inset-0">
        <HeroVideo />
        <div
          className="hidden h-full w-full motion-reduce:block"
          style={{
            background:
              "radial-gradient(circle at 18% 30%, rgba(211,17,25,0.22) 0%, rgba(10,10,10,0.82) 40%, #050505 100%)",
          }}
          aria-hidden="true"
        />
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(4,4,4,0.9)_8%,rgba(4,4,4,0.58)_45%,rgba(4,4,4,0.8)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_34%,rgba(0,0,0,0.55)_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-[clamp(27rem,62vh,46rem)] max-w-7xl items-center px-5 py-16 sm:px-6 md:min-h-[clamp(31rem,66vh,48rem)] md:py-20 lg:px-8 lg:py-24">
        <div className="hero-content-stack max-w-164 text-left">
          <HeroLocationBadge />

          <h1 className="hero-stagger-2 mt-6 max-w-[18ch] text-[clamp(2rem,4.2vw,3.85rem)] font-extrabold leading-[1.02] tracking-[-0.022em] sm:mt-7">
            Zero Pressure.
            <br />
            Total Transparency.
            <br />
            Exceptional Vehicles.
          </h1>

          <p className="hero-stagger-3 mt-5 max-w-[53ch] text-sm leading-relaxed text-zinc-200/90 sm:text-base">
            Hand-selected luxury and performance vehicles at Paterson&apos;s most trusted used car dealer. Fair-market pricing, easy financing for all credit levels, and a team that keeps every step clear from first browse to final signature.
          </p>

          <div className="hero-stagger-3 mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <Link
              href="/inventory"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-accent px-7 py-3.5 text-center text-sm font-bold uppercase tracking-[0.09em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent-light hover:shadow-[0_6px_24px_rgba(211,17,25,0.42)]"
            >
              Browse Inventory
            </Link>

            <Link
              href="/finance"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/25 bg-black/30 px-7 py-3.5 text-center text-sm font-bold uppercase tracking-[0.09em] text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10"
            >
              Get Pre-Approved
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
