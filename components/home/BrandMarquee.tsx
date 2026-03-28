const brands = [
  "Acura", "Audi", "BMW", "Cadillac", "Chevrolet", "Chrysler", "Dodge",
  "Ford", "GMC", "Honda", "Hyundai", "INFINITI", "Jeep", "Kia",
  "Land Rover", "Lexus", "Lincoln", "Mazda", "Mercedes-Benz", "Nissan",
  "Porsche", "Ram", "Subaru", "Toyota", "Volkswagen", "Volvo",
];

function BrandList() {
  return (
    <>
      {brands.map((brand) => (
        <span key={brand} className="flex items-center gap-8 flex-shrink-0">
          <span className="text-sm sm:text-base font-display tracking-widest text-zinc-500 whitespace-nowrap uppercase">
            {brand}
          </span>
          <span className="w-1 h-1 rounded-full bg-accent/40 flex-shrink-0" />
        </span>
      ))}
    </>
  );
}

export function BrandMarquee() {
  return (
    <section className="relative bg-zinc-950 py-6 overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />

      <div className="flex animate-marquee gap-8">
        <BrandList />
        <BrandList />
      </div>
    </section>
  );
}
