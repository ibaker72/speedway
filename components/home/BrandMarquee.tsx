import { VEHICLE_MAKES } from "@/lib/make-logos";

export function BrandMarquee() {
  const makes = VEHICLE_MAKES;

  return (
    <section className="relative bg-[#050505] py-10 md:py-12 overflow-hidden">
      <div className="section-divider absolute top-0 left-0 right-0" />

      <div className="mx-auto max-w-[80rem] px-5 sm:px-6 lg:px-8 mb-6">
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-zinc-600 text-center">
          Brands We Carry
        </p>
      </div>

      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#050505] to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#050505] to-transparent z-10" />

        <div className="flex animate-marquee">
          {[...makes, ...makes].map((make, i) => (
            <div
              key={`${make.name}-${i}`}
              className="flex-shrink-0 px-6 md:px-8 flex items-center justify-center"
            >
              <span className="text-[13px] font-semibold tracking-wide text-zinc-600 hover:text-zinc-400 transition-colors duration-300 whitespace-nowrap uppercase">
                {make.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="section-divider absolute bottom-0 left-0 right-0" />
    </section>
  );
}
