import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { AnimateIn } from "@/components/shared/AnimateIn";

export function WhyBuySection() {
  return (
    <SectionWrapper background="elevated">
      <AnimateIn variant="up">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-[2px] bg-[#1A1A1A] p-8 md:p-10 border border-white/10">
          <div className="flex items-start gap-5">
            <div className="w-[3px] self-stretch bg-accent" />
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Our Mission</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-white">
                As a veteran-owned business, we deliver transparent, no-pressure car buying.
              </h2>
              <p className="mt-5 text-zinc-300 leading-relaxed">
                Speedway Motors was built on discipline, integrity, and service. Every vehicle is selected with care, every number is clearly presented, and every customer is treated with respect from test-drive to delivery.
              </p>
            </div>
          </div>
          </div>
        </div>
      </AnimateIn>
    </SectionWrapper>
  );
}
