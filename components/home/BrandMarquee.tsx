const BRANDS = [
  { name: "Audi", slug: "audi" },
  { name: "BMW", slug: "bmw" },
  { name: "Mercedes-Benz", slug: "mercedes" },
  { name: "Ford", slug: "ford" },
  { name: "Toyota", slug: "toyota" },
  { name: "Honda", slug: "honda" },
  { name: "Chevrolet", slug: "chevrolet" },
  { name: "Nissan", slug: "nissan" },
  { name: "Volkswagen", slug: "volkswagen" },
  { name: "Porsche", slug: "porsche" },
  { name: "Hyundai", slug: "hyundai" },
  { name: "Kia", slug: "kia" },
];

export function BrandMarquee() {
  const loopedBrands = [...BRANDS, ...BRANDS];

  return (
    <section className="relative overflow-hidden bg-[#050505] py-8 md:py-10">
      <div className="mx-auto mb-6 max-w-[80rem] px-5 text-center sm:px-6 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Brands We Carry
        </p>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-16 bg-gradient-to-r from-[#050505] to-transparent sm:w-24" />
        <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-16 bg-gradient-to-l from-[#050505] to-transparent sm:w-24" />

        <div className="flex w-max animate-marquee items-center gap-8 pr-8 [animation-duration:40s] hover:[animation-play-state:paused] md:gap-10">
          {loopedBrands.map((brand, index) => (
            <div key={`${brand.slug}-${index}`} className="flex min-w-[108px] items-center justify-center md:min-w-[130px]">
              <span
                className="inline-block h-6 w-16 bg-zinc-500 transition-all duration-300 hover:scale-110 hover:bg-zinc-200 md:h-8 md:w-20"
                style={{
                  maskImage: `url(https://cdn.simpleicons.org/${brand.slug})`,
                  WebkitMaskImage: `url(https://cdn.simpleicons.org/${brand.slug})`,
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskPosition: "center",
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                }}
                aria-hidden="true"
              />
              <span className="sr-only">{brand.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
