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
    <section className="relative overflow-hidden bg-[#050505] py-10 md:py-12">
      <div className="section-divider absolute top-0 left-0 right-0" />

      <div className="mx-auto mb-7 max-w-[80rem] px-5 text-center sm:px-6 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
          Brands We Carry
        </p>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-24 bg-gradient-to-r from-[#050505] to-transparent" />
        <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-24 bg-gradient-to-l from-[#050505] to-transparent" />

        <div className="flex w-max animate-marquee items-center gap-4 pr-4 [animation-duration:42s] hover:[animation-play-state:paused] md:gap-6">
          {loopedBrands.map((brand, index) => (
            <div
              key={`${brand.slug}-${index}`}
              className="group flex min-w-[138px] items-center justify-center rounded-xl border border-[#1f1f1f] bg-[#0e0e0e]/80 px-5 py-4 transition-all duration-300 hover:border-[#353535]"
            >
              <span
                className="inline-block h-8 w-20 bg-[#888888] transition-all duration-300 group-hover:scale-110 group-hover:bg-white"
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

      <div className="section-divider absolute bottom-0 left-0 right-0" />
    </section>
  );
}
