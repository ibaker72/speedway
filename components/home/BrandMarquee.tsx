"use client";

import Image from "next/image";

const BRANDS = [
  { name: "Audi", src: "/brands/audi.svg" },
  { name: "BMW", src: "/brands/bmw.svg" },
  { name: "BMW M Series", src: "/brands/bmw-m-series.svg", keepOriginalColor: true },
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
] as const;

const SIZE_BY_BRAND: Record<string, string> = {
  "BMW M Series": "max-h-[22px] sm:max-h-[24px] md:max-h-[26px]",
  Porsche: "max-h-[30px] sm:max-h-[34px] md:max-h-[36px]",
  Toyota: "max-h-[30px] sm:max-h-[34px] md:max-h-[36px]",
};

const TRACK_DURATION_SECONDS = 34;

export function BrandMarquee() {
  const renderedBrands = [...BRANDS, ...BRANDS];

  return (
    <section className="relative overflow-hidden border-b border-white/4 bg-[#0A0A0A] py-8 md:py-10">
      <div className="mb-6 px-5 text-center sm:px-6 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          Brands We Carry
        </p>
      </div>

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#0A0A0A] to-transparent sm:w-20 md:w-28" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#0A0A0A] to-transparent sm:w-20 md:w-28" />

        <div
          className="animate-marquee flex w-max items-center gap-12 pr-12 sm:gap-14 sm:pr-14 md:gap-16 md:pr-16 lg:gap-20 lg:pr-20 hover:[animation-play-state:paused]"
          style={{ animationDuration: `${TRACK_DURATION_SECONDS}s` }}
        >
          {renderedBrands.map((brand, index) => (
            <Image
              key={`${brand.name}-${index}`}
              src={brand.src}
              alt={`${brand.name} emblem`}
              width={136}
              height={40}
              priority={index < BRANDS.length}
              title={brand.name}
              className={[
                "h-auto w-auto shrink-0 object-contain opacity-55 transition-opacity duration-300 hover:opacity-90",
                ("keepOriginalColor" in brand && brand.keepOriginalColor) ? "" : "brightness-0 invert",
                SIZE_BY_BRAND[brand.name] ?? "max-h-[26px] sm:max-h-[30px] md:max-h-[32px]",
              ]
                .filter(Boolean)
                .join(" ")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
