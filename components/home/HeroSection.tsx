import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative text-white overflow-hidden">
      <div className="relative aspect-[16/9] min-h-[70svh] max-h-[90svh]">
        {/* TODO: Replace with dealership hero video — use <video autoPlay muted loop playsInline> */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0000] via-[#0a0a0a] to-[#0d0d0d]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(211,17,25,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(211,17,25,0.06),transparent_50%)]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.25),rgba(0,0,0,0.9)_75%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/55 to-black" />

        <div className="relative z-10 mx-auto max-w-[80rem] px-5 sm:px-6 lg:px-8 w-full h-full flex items-end pb-16 md:pb-20">
          <div className="max-w-3xl">
            <p className="text-xs sm:text-sm uppercase tracking-[0.18em] text-zinc-200 font-semibold">
              Paterson, NJ&apos;s Trusted Pre-Owned Dealership
            </p>
            <h1 className="mt-5 heading-luxe text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.03]">
              Precision-Curated Inventory.
              <br />
              High-Trust Car Buying.
            </h1>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
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
