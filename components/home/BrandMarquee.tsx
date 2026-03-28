import { VEHICLE_MAKES, MakeLogo } from "@/lib/make-logos";

function BrandList() {
  return (
    <>
      {VEHICLE_MAKES.map((make) => (
        <span key={make.name} className="flex items-center gap-10 flex-shrink-0">
          <MakeLogo make={make.name} size={16} variant="dark" />
          <span className="w-1 h-1 rounded-full bg-zinc-300 flex-shrink-0" />
        </span>
      ))}
    </>
  );
}

export function BrandMarquee() {
  return (
    <section className="bg-gray-100 py-5 overflow-hidden border-b border-zinc-200">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-32 bg-gradient-to-r from-gray-100 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-32 bg-gradient-to-l from-gray-100 to-transparent z-10 pointer-events-none" />

      {/* Marquee */}
      <div className="relative flex animate-marquee gap-10">
        <BrandList />
        <BrandList />
      </div>
    </section>
  );
}
