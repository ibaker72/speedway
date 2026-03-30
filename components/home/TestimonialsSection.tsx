import { Star, ExternalLink } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { testimonials } from "@/lib/data/testimonials";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { BUSINESS } from "@/lib/constants";

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
        subtitle="See what our customers are saying about their experience at Speedway Motors."
      />

      {/* Google Reviews Aggregate Badge */}
      <AnimateIn variant="up">
        <div className="flex justify-center mb-10">
          <a
            href={BUSINESS.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-4 rounded-2xl bg-surface-2 border border-white/[0.08] px-6 py-4 hover:border-white/[0.15] transition-all group"
          >
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-white">{BUSINESS.stats.googleRating}</div>
              <Stars />
            </div>
            <div className="border-l border-white/[0.08] pl-4">
              <p className="text-sm font-semibold text-white">{BUSINESS.stats.totalReviews}+ Google Reviews</p>
              <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                View on Google
                <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
              </p>
            </div>
          </a>
        </div>
      </AnimateIn>

      {/* TODO: Replace generic reviewer names with real customer first names + last initial when available */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        {testimonials.slice(0, 3).map((t, i) => (
          <AnimateIn key={t.id} variant="up" delay={i * 100}>
            <article className="rounded-[2px] bg-[#1A1A1A] p-7 border border-white/10 h-full">
              <Stars />
              <blockquote className="mt-4 text-sm text-zinc-300 leading-relaxed">&ldquo;{t.text}&rdquo;</blockquote>
              <div className="mt-6 pt-5 border-t border-white/10">
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <p className="text-xs text-zinc-500 mt-1">Verified Google Review</p>
              </div>
            </article>
          </AnimateIn>
        ))}
      </div>
    </SectionWrapper>
  );
}
