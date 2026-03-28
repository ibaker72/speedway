import { Star, ArrowRight } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
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
    <SectionWrapper background="white">
      <SectionHeading
        title="What Our Customers Say"
        subtitle={`Rated 4.7 out of 5 based on 380+ reviews.`}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.slice(0, 3).map((t) => (
          <div
            key={t.id}
            className="rounded-xl border border-zinc-200 p-6 bg-white"
          >
            <StarRating rating={t.rating} />
            <blockquote className="mt-4 text-sm text-zinc-700 leading-relaxed">
              &ldquo;{t.text}&rdquo;
            </blockquote>
            <div className="mt-4 pt-4 border-t border-zinc-100">
              <div className="font-semibold text-sm text-zinc-900">{t.name}</div>
              {t.vehiclePurchased && (
                <div className="text-xs text-zinc-500 mt-0.5">
                  Purchased a {t.vehiclePurchased}
                </div>
              )}
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-[8px] font-bold">G</span>
                </div>
                <span className="text-xs text-zinc-400">Google Review</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Button href="/reviews" variant="ghost" size="md">
          Read All Reviews
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </SectionWrapper>
  );
}
