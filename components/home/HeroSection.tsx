export function HeroSection() {
  return (
    <section className="relative overflow-hidden text-white">
      <div className="hero-video-shell relative min-h-[70vh] max-h-[860px] w-full">
        <video
          className="hero-video absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>

        <div className="hero-video-overlay absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_30%,rgba(255,255,255,0.06),transparent_55%)]" />

        <div className="relative z-10 mx-auto flex min-h-[70vh] w-full max-w-[1280px] items-end px-6 pb-16 pt-24 md:px-10">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              Paterson, NJ&apos;s Trusted Pre-Owned Dealership
            </p>

            <h1 className="mt-4 text-5xl font-black uppercase leading-[0.95] tracking-[-0.03em] md:text-7xl">
              Precision-Curated Inventory.
              <br />
              High-Trust Car Buying.
            </h1>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/inventory"
                className="rounded-full bg-red-600 px-8 py-4 text-sm font-bold uppercase tracking-[0.08em] text-white transition hover:bg-red-500"
              >
                Browse Inventory
              </a>

              <a
                href="/financing"
                className="rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-bold uppercase tracking-[0.08em] text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                Get Pre-Approved
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}