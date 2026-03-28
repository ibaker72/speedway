import { Star, ArrowRight } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { Button } from "@/components/ui/button";
import { testimonials } from "@/lib/data/testimonials";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-200"}`}
        />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <SectionWrapper background="light">
      <SectionHeading
        title="What Our Customers Say"
        subtitle="Real reviews from real customers. Rated 4.8 out of 5 on Google."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        {testimonials.slice(0, 3).map((t, i) => (
          <AnimateIn key={t.id} delay={i * 100} variant="up">
            <div className="rounded-lg border border-zinc-200 p-7 bg-white hover:shadow-md transition-shadow duration-300 h-full">
              <StarRating rating={t.rating} />

              <blockquote className="mt-4 text-sm text-zinc-600 leading-relaxed">
                &ldquo;{t.text}&rdquo;
              </blockquote>

              <div className="mt-5 pt-5 border-t border-zinc-100">
                <div className="font-semibold text-sm text-zinc-900">
                  {t.name}
                </div>
                {t.vehiclePurchased && (
                  <div className="text-xs text-zinc-400 mt-0.5">
                    Purchased a {t.vehiclePurchased}
                  </div>
                )}
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-[9px] font-bold">G</span>
                  </div>
                  <span className="text-[11px] text-zinc-400">
                    Verified Google Review
                  </span>
                </div>
              </div>
            </div>
          </AnimateIn>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Button href="/reviews" variant="ghost" size="md">
          Read All Reviews
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </SectionWrapper>
  );
}
