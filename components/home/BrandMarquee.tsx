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
        <span key={brand} className="flex items-center gap-6 flex-shrink-0">
          <span className="text-sm sm:text-base font-display tracking-wide text-zinc-300 whitespace-nowrap">
            {brand}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-700/60 flex-shrink-0" />
        </span>
      ))}
    </>
  );
}

export function BrandMarquee() {
  return (
    <section className="bg-zinc-950 border-y border-amber-900/10 py-5 overflow-hidden">
      <div className="flex animate-marquee gap-6">
        <BrandList />
        <BrandList />
      </div>
    </section>
  );
}
