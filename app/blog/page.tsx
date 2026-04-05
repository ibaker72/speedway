import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { BUSINESS } from "@/lib/constants";
import { blogPosts } from "@/lib/data/blog-posts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Car Buying Tips, Financing Advice & More | Speedway Motors Blog",
  description:
    "Expert car buying tips, financing guides, and vehicle comparisons from Speedway Motors in Paterson, NJ. Make smarter decisions on your next vehicle purchase.",
  alternates: {
    canonical: "https://www.speedwaymotorsllc.com/blog",
  },
};

const categoryLabels: Record<string, string> = {
  "buying-tips": "Buying Tips",
  financing: "Financing",
  maintenance: "Maintenance",
  comparisons: "Comparisons",
  local: "Local",
};

export default function BlogPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${BUSINESS.website}/` },
          { name: "Blog", url: `${BUSINESS.website}/blog` },
        ]}
      />

      <PageHero
        eyebrow="Resources"
        title="Car Buying Tips & Advice"
        subtitle="Expert guidance to help you make smarter car buying decisions."
      />

      <SectionWrapper background="charcoal">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {blogPosts.map((post, i) => (
            <AnimateIn key={post.slug} delay={i * 80} variant="up">
              <Link
                href={`/blog/${post.slug}`}
                className="card-glass p-6 h-full flex flex-col group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-block px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider bg-accent/10 text-accent-light rounded-full border border-accent/20">
                    {categoryLabels[post.category] || post.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-zinc-500">
                    <Clock className="h-3 w-3" />
                    {post.readTime} min read
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mb-2 group-hover:text-accent-light transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed flex-1">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/6">
                  <span className="text-xs text-zinc-500">
                    {new Date(post.datePublished).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-light group-hover:text-white transition-colors">
                    {`Read ${post.title}`}
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </AnimateIn>
          ))}
        </div>
      </SectionWrapper>
    </>
  );
}
