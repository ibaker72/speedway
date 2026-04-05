import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { InlineLeadCTA } from "@/components/shared/InlineLeadCTA";
import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/lib/constants";
import { blogPosts } from "@/lib/data/blog-posts";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.title,
    description: post.metaDescription,
    alternates: {
      canonical: `https://www.speedwaymotorsllc.com/blog/${post.slug}`,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.metaDescription,
      url: `https://www.speedwaymotorsllc.com/blog/${post.slug}`,
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
      authors: [post.author],
    },
  };
}

function ArticleJsonLd({ post }: { post: typeof blogPosts[0] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    author: {
      "@type": "Organization",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Speedway Motors LLC",
      url: "https://www.speedwaymotorsllc.com",
      logo: {
        "@type": "ImageObject",
        url: "https://www.speedwaymotorsllc.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.speedwaymotorsllc.com/blog/${post.slug}`,
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

const categoryLabels: Record<string, string> = {
  "buying-tips": "Buying Tips",
  financing: "Financing",
  maintenance: "Maintenance",
  comparisons: "Comparisons",
  local: "Local",
};

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const relatedPosts = blogPosts
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 2);

  // Split content into paragraphs and render with headings
  const paragraphs = post.content.split("\n\n");

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${BUSINESS.website}/` },
          { name: "Blog", url: `${BUSINESS.website}/blog` },
          { name: post.title, url: `${BUSINESS.website}/blog/${post.slug}` },
        ]}
      />
      <ArticleJsonLd post={post} />

      <PageHero
        eyebrow={categoryLabels[post.category] || post.category}
        title={post.title}
        subtitle={post.excerpt}
        compact
      />

      <SectionWrapper background="charcoal">
        <div className="max-w-3xl mx-auto">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-zinc-500">
            <span>By {post.author}</span>
            <span>&middot;</span>
            <span>
              {new Date(post.datePublished).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span>&middot;</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime} min read
            </span>
          </div>

          {/* Article Content */}
          <article className="prose-dark space-y-5">
            {paragraphs.map((p, i) => {
              if (p.startsWith("## ")) {
                return (
                  <h2 key={i} className="text-xl font-bold text-white mt-8 mb-4">
                    {p.replace("## ", "")}
                  </h2>
                );
              }
              return (
                <p key={i} className="text-zinc-400 leading-relaxed">
                  {p}
                </p>
              );
            })}
          </article>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-white/6 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 text-xs text-zinc-400 bg-white/4 border border-white/6 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Lead Magnet CTA */}
          <div className="mt-8">
            <InlineLeadCTA variant="buying-guide" />
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-12 pt-8 border-t border-white/6">
              <h3 className="text-lg font-bold text-white mb-4">Related Articles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedPosts.map((rp) => (
                  <Link
                    key={rp.slug}
                    href={`/blog/${rp.slug}`}
                    className="p-4 rounded-xl border border-white/8 bg-surface-1 hover:bg-surface-2 transition-colors group"
                  >
                    <span className="inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-accent/10 text-accent-light rounded-full border border-accent/20 mb-2">
                      {categoryLabels[rp.category]}
                    </span>
                    <h4 className="text-sm font-semibold text-white group-hover:text-accent-light transition-colors">
                      {rp.title}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-1">{rp.readTime} min read</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Browse CTA */}
          <div className="mt-10 text-center">
            <Button href="/inventory" variant="primary" size="lg">
              Browse Our Inventory <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Back to Blog */}
          <div className="mt-6 text-center">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-accent-light transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Blog
            </Link>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
