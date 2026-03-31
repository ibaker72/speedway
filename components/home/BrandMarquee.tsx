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
  return (
    <section className="bg-[#0A0A0A] px-5 py-10 sm:px-6 md:py-12 lg:px-8 border-b border-white/[0.04]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Brands We Carry</p>
        </div>

        <div className="grid grid-cols-3 gap-x-2 gap-y-5 sm:grid-cols-4 sm:gap-y-6 md:grid-cols-6 md:gap-y-7 lg:gap-y-8 items-center justify-items-center">
          {BRANDS.map((brand) => (
            <div key={brand} className="group flex justify-center w-full">
              <MakeLogo
                make={brand}
                mode="emblem"
                size={30}
                variant="light"
                className="text-zinc-500/95 opacity-85 group-hover:opacity-100 group-hover:text-zinc-300 transition-all duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
