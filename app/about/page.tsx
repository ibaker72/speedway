import {
  ShieldCheck,
  Users,
  MapPin,
  Star,
  Car,
  ArrowRight,
  Award,
} from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { Button } from "@/components/ui/button";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { BUSINESS } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${BUSINESS.name}, a trusted used car dealership in Paterson, NJ serving the community since 2005 with quality vehicles and flexible financing.`,
};

const values = [
  {
    icon: ShieldCheck,
    title: "Quality First",
    description:
      "Every vehicle in our inventory is thoroughly inspected before it reaches our lot. We stand behind the quality of what we sell.",
  },
  {
    icon: Users,
    title: "Customer Focused",
    description:
      "We take the time to understand your needs and budget. Our goal is to help you find the right vehicle — not just close a deal.",
  },
  {
    icon: Award,
    title: "Honest & Transparent",
    description:
      "Clear pricing, no hidden fees, and straightforward communication. We believe trust is the foundation of every great relationship.",
  },
];

const stats = [
  { value: `${BUSINESS.stats.yearsInBusiness}+`, label: "Years in Business" },
  { value: `${BUSINESS.stats.vehiclesInStock}+`, label: "Vehicles in Stock" },
  { value: BUSINESS.stats.customersServed, label: "Happy Customers" },
  { value: `${BUSINESS.stats.googleRating}★`, label: "Google Rating" },
];

export default function AboutPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", url: `${BUSINESS.website}/` }, { name: "About", url: `${BUSINESS.website}/about` }]} />
      <PageHero
        eyebrow="About Speedway Motors"
        title="A Better Dealership Experience Starts Here"
        subtitle="Serving Paterson, NJ and surrounding communities with quality pre-owned vehicles and flexible financing since 2005."
      />

      {/* Stats band */}
      <section className="bg-[#0a0a0a] py-12 md:py-14 border-y border-white/[0.04]">
        <div className="mx-auto max-w-[80rem] px-5 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <AnimateIn key={stat.label} delay={i * 100} variant="up">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-zinc-500">{stat.label}</div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <SectionWrapper background="charcoal">
        <div className="max-w-3xl mx-auto text-center">
          <SectionHeading
            eyebrow="Our Story"
            title="Built on Trust, Driven by Service"
          />
          <div className="space-y-5 text-zinc-400 leading-relaxed text-base md:text-lg">
            <p>
              {BUSINESS.name} was founded in 2005 with a simple mission: make buying
              a used car a positive experience. Based in Paterson, New Jersey, we&apos;ve
              grown from a small lot to three locations — serving thousands of customers
              across Passaic County and beyond.
            </p>
            <p>
              We carry {BUSINESS.stats.brandsCarried}+ brands across every category —
              sedans, SUVs, trucks, vans, and commercial vehicles. Every vehicle is
              inspected, competitively priced, and backed by our commitment to quality.
            </p>
            <p>
              We believe everyone deserves reliable transportation, regardless of credit
              history. That&apos;s why we work with multiple lenders to offer financing
              solutions for every situation — from excellent credit to first-time buyers.
            </p>
          </div>
        </div>
      </SectionWrapper>

      {/* Values */}
      <SectionWrapper background="dark">
        <SectionHeading
          eyebrow="Our Values"
          title="What Sets Us Apart"
          subtitle="More than just a car lot — we're a team committed to your satisfaction."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {values.map((value, i) => {
            const Icon = value.icon;
            return (
              <AnimateIn key={value.title} delay={i * 100} variant="up">
                <div className="card-glass p-8 text-center h-full">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/15 flex items-center justify-center mx-auto mb-5">
                    <Icon className="h-6 w-6 text-accent-light" />
                  </div>
                  <h3 className="font-semibold text-white text-lg mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </AnimateIn>
            );
          })}
        </div>
      </SectionWrapper>

      {/* Dealership area — placeholder for team/showroom imagery */}
      {/* Replace with: /public/placeholders/about/showroom-placeholder.jpg */}
      <SectionWrapper background="elevated">
        <div className="max-w-4xl mx-auto text-center">
          <SectionHeading
            eyebrow="Visit Us"
            title="Come See the Difference"
            subtitle="We invite you to visit any of our three Paterson, NJ locations and experience the Speedway difference firsthand."
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { icon: MapPin, text: "3 Convenient Locations" },
              { icon: Car, text: `${BUSINESS.stats.vehiclesInStock}+ Vehicles on Lot` },
              { icon: Star, text: `${BUSINESS.stats.googleRating}★ Google Rating` },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <AnimateIn key={item.text} delay={i * 80} variant="up">
                  <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <Icon className="h-5 w-5 text-accent-light flex-shrink-0" />
                    <span className="text-sm text-zinc-300">{item.text}</span>
                  </div>
                </AnimateIn>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button href="/inventory" variant="primary" size="lg">
              Browse Inventory
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="/contact" variant="outline" size="lg">
              Contact Us
            </Button>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
