"use client";

import Image from "next/image";

const BRANDS = [
  { name: "Audi", src: "/brands/audi.svg" },
  { name: "BMW", src: "/brands/bmw.svg" },
  { name: "BMW M Series", src: "/brands/bmw-m-series.svg" },
  { name: "Fiat", src: "/brands/fiat.svg" },
  { name: "Fisker", src: "/brands/fisker.svg" },
  { name: "Ford", src: "/brands/ford.svg" },
  { name: "GMC", src: "/brands/gmc.svg" },
  { name: "Honda", src: "/brands/honda.svg" },
  { name: "Hyundai", src: "/brands/hyundai.svg" },
  { name: "Infiniti", src: "/brands/infiniti.svg" },
  { name: "Jaguar", src: "/brands/jaguar.svg" },
  { name: "Jeep", src: "/brands/jeep.svg" },
  { name: "Kia", src: "/brands/kia.svg" },
  { name: "Land Rover", src: "/brands/land-rover.svg" },
  { name: "Lexus", src: "/brands/lexus.svg" },
  { name: "Lincoln", src: "/brands/lincoln.svg" },
  { name: "Maserati", src: "/brands/maserati.svg" },
  { name: "Mazda", src: "/brands/mazda.svg" },
  { name: "Mercedes-Benz", src: "/brands/mercedes-benz.svg" },
  { name: "Mitsubishi", src: "/brands/mitsubishi.svg" },
  { name: "Nissan", src: "/brands/nissan.svg" },
  { name: "Pontiac", src: "/brands/pontiac.svg" },
  { name: "Porsche", src: "/brands/porsche.svg" },
  { name: "RAM", src: "/brands/ram.svg" },
  { name: "Toyota", src: "/brands/toyota.svg" },
  { name: "Volkswagen", src: "/brands/volkswagen.svg" },
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

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#0A0A0A] to-transparent sm:w-16 md:w-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#0A0A0A] to-transparent sm:w-16 md:w-20" />

        <div className="flex w-max animate-marquee items-center gap-4 pr-4 [animation-duration:26s] sm:gap-5 sm:pr-5 md:gap-8 md:pr-8 md:[animation-duration:34s] lg:[animation-duration:40s]">
          {loopedBrands.map((brand, index) => (
            <div
              key={`${brand.name}-${index}`}
              className="flex h-[72px] min-w-[120px] items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.02] px-6 backdrop-blur-sm sm:min-w-[132px] md:h-[82px] md:min-w-[148px] md:px-7"
              aria-label={brand.name}
              title={brand.name}
            >
              <Image
                src={brand.src}
                alt={`${brand.name} emblem`}
                width={96}
                height={48}
                className="h-auto max-h-[34px] w-auto object-contain opacity-70 grayscale transition-opacity duration-300 sm:max-h-[38px] md:max-h-[44px] md:opacity-75"
                priority={index < BRANDS.length}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}