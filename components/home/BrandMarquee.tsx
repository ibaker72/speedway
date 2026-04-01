"use client";

import { MakeLogo } from "@/lib/make-logos";

const BRANDS = [
  "Audi",
  "BMW",
  "Mercedes-Benz",
  "Ford",
  "Toyota",
  "Honda",
  "Chevrolet",
  "Nissan",
  "Volkswagen",
  "Porsche",
  "Hyundai",
  "Kia",
];

export function BrandMarquee() {
  const loopedBrands = [...BRANDS, ...BRANDS];

  return (
    <section className="relative overflow-hidden border-b border-white/[0.04] bg-[#0A0A0A] py-7 md:py-10">
      <div className="mb-5 px-5 text-center sm:px-6 lg:px-8 md:mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          Brands We Carry
        </p>
      </div>

      {/* Mobile: horizontal emblem rail */}
      <div className="relative md:hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#0A0A0A] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[#0A0A0A] to-transparent" />

        <div className="overflow-x-auto px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max snap-x snap-mandatory items-center gap-3 pr-4">
            {BRANDS.map((brand) => (
              <div
                key={brand}
                className="flex h-14 min-w-[120px] snap-start items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 backdrop-blur-sm"
                aria-label={brand}
                title={brand}
              >
                <MakeLogo
                  make={brand}
                  size={26}
                  variant="light"
                  className="text-zinc-500 transition-colors duration-200"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: premium marquee */}
      <div className="relative hidden md:block">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#0A0A0A] to-transparent lg:w-28" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#0A0A0A] to-transparent lg:w-28" />

        <div className="flex w-max animate-marquee items-center gap-12 pr-12 [animation-duration:42s] hover:[animation-play-state:paused] lg:gap-16">
          {loopedBrands.map((brand, index) => (
            <div
              key={`${brand}-${index}`}
              className="group flex min-w-[132px] items-center justify-center lg:min-w-[150px]"
              aria-label={brand}
              title={brand}
            >
              <MakeLogo
                make={brand}
                size={28}
                variant="light"
                className="text-zinc-600 transition-colors duration-300 group-hover:text-zinc-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}