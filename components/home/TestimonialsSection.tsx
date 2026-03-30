import { Star } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { testimonials } from "@/lib/data/testimonials";

function Stars() {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <SectionWrapper background="dark">
      <SectionHeading
        eyebrow="Google Reviews"
        title="Trusted by New Jersey Drivers"
        subtitle="A clean 3-column review layout inspired by premium dealer experiences."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        {testimonials.slice(0, 3).map((t) => (
          <article key={t.id} className="rounded-[2px] bg-[#0f0f0f] p-7 border border-white/10">
            <Stars />
            <blockquote className="mt-4 text-sm text-zinc-300 leading-relaxed">&ldquo;{t.text}&rdquo;</blockquote>
            <div className="mt-6 pt-5 border-t border-white/10">
              <p className="text-sm font-semibold text-white">{t.name}</p>
              <p className="text-xs text-zinc-500 mt-1">Verified Google Review</p>
            </div>
          </article>
        ))}
      </div>
    </SectionWrapper>
  );
}
