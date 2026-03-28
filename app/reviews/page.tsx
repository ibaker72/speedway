import { Star } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { testimonials } from "@/lib/data/testimonials";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Reviews",
  description: "Read real reviews from Speedway Motors customers. Rated 4.8 out of 5 on Google with 120+ reviews.",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-accent text-accent" : "text-zinc-200"}`} />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <SectionWrapper background="white">
      <SectionHeading title="Customer Reviews" subtitle="Rated 4.8 out of 5 based on 120+ Google reviews." as="h1" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {testimonials.map((t) => (
          <div key={t.id} className="relative rounded-2xl border border-zinc-200/80 p-7 bg-white hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
            <span className="absolute top-3 left-5 text-7xl font-display text-zinc-100 leading-none select-none pointer-events-none">&ldquo;</span>
            <div className="relative">
              <StarRating rating={t.rating} />
              <blockquote className="mt-5 text-sm text-zinc-600 leading-relaxed">&ldquo;{t.text}&rdquo;</blockquote>
              <div className="mt-5 pt-5 border-t border-zinc-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center flex-shrink-0 ring-2 ring-accent/20">
                    <span className="text-accent text-sm font-bold">{t.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-zinc-900">{t.name}</div>
                    {t.vehiclePurchased && <div className="text-xs text-zinc-400 mt-0.5">Purchased a {t.vehiclePurchased}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-3">
                  <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-[9px] font-bold">G</span>
                  </div>
                  <span className="text-xs text-zinc-400">Google Review</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
