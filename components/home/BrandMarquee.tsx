import { MakeLogo } from "@/lib/make-logos";

const BRANDS = [
  "Audi", "BMW", "Mercedes-Benz", "Ford", "Toyota", "Honda",
  "Chevrolet", "Nissan", "Volkswagen", "Porsche", "Hyundai", "Kia",
];

export function BrandMarquee() {
  const loopedBrands = [...BRANDS, ...BRANDS];

  return (
    <section className="relative overflow-hidden bg-[#0A0A0A] py-10 md:py-14">
      <div className="mb-8 px-5 text-center sm:px-6 lg:px-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600">
          Brands We Carry
        </p>
      </div>

      <div className="relative">
        {/* Fade edges */}
        <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-20 bg-gradient-to-r from-[#0A0A0A] to-transparent sm:w-28 lg:w-36" />
        <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-20 bg-gradient-to-l from-[#0A0A0A] to-transparent sm:w-28 lg:w-36" />

        <div className="flex w-max animate-marquee items-center gap-14 pr-14 [animation-duration:45s] hover:[animation-play-state:paused] md:gap-20 lg:gap-24">
          {loopedBrands.map((brand, index) => (
            <div
              key={`${brand}-${index}`}
              className="group flex items-center justify-center"
            >
              <MakeLogo
                make={brand}
                size={28}
                variant="light"
                className="text-zinc-500 group-hover:text-zinc-200 transition-all duration-500"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
