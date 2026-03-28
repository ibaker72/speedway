import { VEHICLE_MAKES, MakeLogo } from "@/lib/make-logos";

function BrandList() {
  return (
    <>
      {VEHICLE_MAKES.map((make) => (
        <span key={make.name} className="flex items-center gap-10 flex-shrink-0">
          <MakeLogo make={make.name} size={16} variant="light" />
          <span className="w-1 h-1 rounded-full bg-accent/30 flex-shrink-0" />
        </span>
      ))}
    </>
  );
}

export function BrandMarquee() {
  return (
    <section className="relative bg-zinc-950 py-5 overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />

      {/* Label */}
      <div className="absolute left-0 top-0 bottom-0 w-32 sm:w-48 bg-gradient-to-r from-zinc-950 via-zinc-950/95 to-transparent z-10 flex items-center justify-start pl-4 sm:pl-8">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent/60 whitespace-nowrap">
          We Carry
        </span>
      </div>

      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-32 sm:w-48 bg-gradient-to-l from-zinc-950 via-zinc-950/95 to-transparent z-10" />

      {/* Marquee */}
      <div className="flex animate-marquee gap-10 pl-36 sm:pl-52">
        <BrandList />
        <BrandList />
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
    </section>
  );
}
