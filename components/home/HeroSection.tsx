import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden text-white">
      <div className="hero-video-shell relative min-h-[70svh] max-h-[90svh] aspect-[16/9]">
        <video
          className="hero-video"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
        </video>

        <div className="hero-video-overlay" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(211,17,25,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(211,17,25,0.06),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.18),rgba(0,0,0,0.78)_75%)]" />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-[80rem] items-end px-5 pb-16 sm:px-6 md:pb-20 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-200 sm:text-sm">
              Paterson, NJ&apos;s Trusted Pre-Owned Dealership
            </p>
            <h1 className="heading-luxe mt-5 text-4xl font-bold leading-[1.03] sm:text-5xl lg:text-6xl">
              Precision-Curated Inventory.
              <br />
              High-Trust Car Buying.
            </h1>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button href="/inventory" variant="primary" size="lg" className="rounded-[2px] uppercase tracking-[0.07em]">
                Browse Inventory
              </Button>
              <Button href="/finance" variant="outline" size="lg" className="rounded-[2px] border-white/60 uppercase tracking-[0.07em]">
                Get Pre-Approved
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
