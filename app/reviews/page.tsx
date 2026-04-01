import { Star } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { BUSINESS } from "@/lib/constants";
import { testimonials } from "@/lib/data/testimonials";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Reviews",
  description:
    "Read real reviews from Speedway Motors customers. Rated 4.8 out of 5 on Google with 120+ reviews.",
  alternates: {
    canonical: "https://www.speedwaymotorsllc.com/reviews",
  },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-zinc-700"
          }`}
        />
      ))}
    </div>
  );
}

function ReviewAggregateJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": BUSINESS.name,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": String(BUSINESS.stats.googleRating),
      "reviewCount": String(BUSINESS.stats.totalReviews),
      "bestRating": "5",
      "worstRating": "1",
    },
    "review": testimonials.slice(0, 3).map((t) => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": String(t.rating),
        "bestRating": "5",
      },
      "author": {
        "@type": "Person",
        "name": t.name,
      },
      "reviewBody": t.text,
      "datePublished": t.date,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function ReviewsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${BUSINESS.website}/` },
          { name: "Reviews", url: `${BUSINESS.website}/reviews` },
        ]}
      />
      <ReviewAggregateJsonLd />
      <PageHero
        eyebrow="Customer Reviews"
        title="What Our Customers Say"
        subtitle={`Rated ${BUSINESS.stats.googleRating} out of 5 based on ${BUSINESS.stats.totalReviews}+ Google reviews.`}
      >
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className="h-6 w-6 fill-yellow-400 text-yellow-400"
            />
          ))}
        </div>
      </PageHero>

      <SectionWrapper background="charcoal">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <AnimateIn key={t.id} delay={i * 60} variant="up">
              <div className="card-glass p-7 h-full">
                <StarRating rating={t.rating} />

                <blockquote className="mt-4 text-sm text-zinc-300 leading-relaxed">
                  &ldquo;{t.text}&rdquo;
                </blockquote>

                <div className="mt-6 pt-5 border-t border-white/[0.06]">
                  <div className="font-semibold text-sm text-white">
                    {t.name}
                  </div>
                  {t.vehiclePurchased && (
                    <div className="text-xs text-zinc-400 mt-0.5">
                      Purchased: {t.vehiclePurchased}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <div className="w-4 h-4 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                      <span className="text-blue-400 text-[9px] font-bold">
                        G
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-500">
                      Verified Google Review
                    </span>
                  </div>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>
      </SectionWrapper>
    </>
  );
}
