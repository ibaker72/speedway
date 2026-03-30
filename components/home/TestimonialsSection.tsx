import { Star, ExternalLink, ArrowRight } from "lucide-react";
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

const AVATAR_COLORS = [
  "bg-accent/20 text-accent-light",
  "bg-emerald-500/20 text-emerald-400",
  "bg-blue-500/20 text-blue-400",
  "bg-amber-500/20 text-amber-400",
  "bg-purple-500/20 text-purple-400",
  "bg-cyan-500/20 text-cyan-400",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash) + name.charCodeAt(i);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
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
            className="inline-flex items-center gap-5 rounded-2xl bg-surface-2 border border-white/[0.08] px-8 py-5 hover:border-white/[0.15] transition-all group"
          >
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold text-white">{BUSINESS.stats.googleRating}</div>
              <Stars />
            </div>
            <div className="border-l border-white/[0.08] pl-5">
              <p className="text-base font-semibold text-white">{BUSINESS.stats.totalReviews}+ Google Reviews</p>
              <p className="text-sm text-accent-light flex items-center gap-1.5 mt-1 font-medium">
                Read all reviews
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </p>
            </div>
          </a>
        </div>
      </AnimateIn>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        {testimonials.slice(0, 3).map((t, i) => (
          <AnimateIn key={t.id} variant="up" delay={i * 100}>
            <article className="rounded-lg bg-[#1A1A1A] p-7 border border-white/[0.06] h-full">
              <Stars />
              <blockquote className="mt-4 text-sm text-zinc-300 leading-relaxed">&ldquo;{t.text}&rdquo;</blockquote>
              <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarColor(t.name)}`}>
                  {getInitials(t.name)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  {t.vehiclePurchased && (
                    <p className="text-xs text-zinc-400 mt-0.5">Purchased: {t.vehiclePurchased}</p>
                  )}
                  <p className="text-[10px] text-zinc-600 mt-0.5 flex items-center gap-1">
                    <ExternalLink className="h-2.5 w-2.5" />
                    Verified Google Review
                  </p>
                </div>
              </div>
            </article>
          </AnimateIn>
        ))}
      </div>
    </SectionWrapper>
  );
}
