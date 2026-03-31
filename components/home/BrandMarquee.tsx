import { MakeLogo } from "@/lib/make-logos";

const BRANDS = [
  "Audi", "BMW", "Mercedes-Benz", "Ford", "Toyota", "Honda",
  "Chevrolet", "Nissan", "Volkswagen", "Porsche", "Hyundai", "Kia",
];

export function BrandMarquee() {
  const loopedBrands = [...BRANDS, ...BRANDS];

  return (
    <section className="relative overflow-hidden bg-[#0A0A0A] py-8 md:py-10">
      <div className="mb-6 px-5 text-center sm:px-6 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Brands We Carry
        </p>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-16 bg-gradient-to-r from-[#0A0A0A] to-transparent sm:w-24" />
        <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-16 bg-gradient-to-l from-[#0A0A0A] to-transparent sm:w-24" />

        <div className="flex w-max animate-marquee items-center gap-10 pr-10 [animation-duration:40s] hover:[animation-play-state:paused] md:gap-14">
          {loopedBrands.map((brand, index) => (
            <div
              key={`${brand}-${index}`}
              className="group flex min-w-[120px] items-center justify-center md:min-w-[140px]"
            >
              <MakeLogo
                make={brand}
                size={24}
                variant="light"
                className="text-zinc-500 group-hover:text-zinc-300 transition-colors duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
