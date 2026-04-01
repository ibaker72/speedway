import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Car, Shield, Star, MapPin, Gauge, Fuel, Cog } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { VehicleImage } from "@/components/shared/VehicleImage";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { Button } from "@/components/ui/button";
import { getInventory } from "@/lib/data/inventory-source";
import { formatPrice, formatMileage, estimateMonthlyPayment } from "@/lib/data/vehicles-full";
import { BUSINESS } from "@/lib/constants";
import { serviceAreas } from "@/lib/data/service-areas";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return serviceAreas.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const area = serviceAreas.find((a) => a.slug === slug);
  if (!area) return { title: "Location Not Found" };

  return {
    title: `Used Cars in ${area.city}, ${area.state} | Speedway Motors`,
    description: `Browse 180+ quality used cars near ${area.city}, ${area.state}. Sedans, SUVs, trucks & vans with easy financing. Visit Speedway Motors in Paterson, NJ — just ${area.distanceMiles} miles away.`,
    alternates: {
      canonical: `https://www.speedwaymotorsllc.com/locations/${area.slug}`,
    },
  };
}

function CityFAQJsonLd({ area }: { area: typeof serviceAreas[0] }) {
  const faqs = [
    {
      question: `How far is Speedway Motors from ${area.city}?`,
      answer: `Speedway Motors is located at 302-304 22nd Ave in Paterson, NJ, just ${area.distanceMiles} miles from ${area.city}. The drive typically takes ${Math.max(5, area.distanceMiles * 3)} minutes depending on traffic.`,
    },
    {
      question: `Do you offer financing for ${area.city} residents?`,
      answer: `Yes! We offer flexible auto financing for all ${area.city} residents, regardless of credit history. We work with multiple lenders to find the best rates for bad credit, no credit, and first-time buyers.`,
    },
    {
      question: "Can I trade in my car at Speedway Motors?",
      answer: "Absolutely. We accept trade-ins on all purchases and also buy vehicles outright — no trade required. Visit us or submit your vehicle details online for a quick estimate.",
    },
    {
      question: `What types of vehicles do you have for ${area.city} drivers?`,
      answer: `We maintain an inventory of 180+ vehicles including sedans, SUVs, trucks, vans, and commercial vehicles from 20+ brands. Our inventory is updated regularly with new arrivals.`,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}

export default async function LocationPage({ params }: PageProps) {
  const { slug } = await params;
  const area = serviceAreas.find((a) => a.slug === slug);
  if (!area) notFound();

  const { vehicles } = await getInventory({ perPage: 6 });

  const valuePros = [
    { icon: Car, title: "180+ Vehicles", description: "Sedans, SUVs, trucks, vans & commercial — refreshed weekly." },
    { icon: Shield, title: "All Credit Welcome", description: "Flexible financing for every situation. Same-day approvals available." },
    { icon: Star, title: "4.8★ Rated", description: "Trusted by thousands across North Jersey for 20+ years." },
  ];

  const faqs = [
    {
      question: `How far is Speedway Motors from ${area.city}?`,
      answer: `Speedway Motors is located at 302-304 22nd Ave in Paterson, NJ, just ${area.distanceMiles} miles from ${area.city}. The drive typically takes ${Math.max(5, area.distanceMiles * 3)} minutes depending on traffic.`,
    },
    {
      question: `Do you offer financing for ${area.city} residents?`,
      answer: `Yes! We offer flexible auto financing for all ${area.city} residents, regardless of credit history. We work with multiple lenders to find the best rates for bad credit, no credit, and first-time buyers.`,
    },
    {
      question: "Can I trade in my car at Speedway Motors?",
      answer: "Absolutely. We accept trade-ins on all purchases and also buy vehicles outright — no trade required. Visit us or submit your vehicle details online for a quick estimate.",
    },
    {
      question: `What types of vehicles do you have for ${area.city} drivers?`,
      answer: `We maintain an inventory of 180+ vehicles including sedans, SUVs, trucks, vans, and commercial vehicles from 20+ brands. Our inventory is updated regularly with new arrivals.`,
    },
  ];

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${BUSINESS.website}/` },
          { name: "Locations", url: `${BUSINESS.website}/locations` },
          { name: area.city, url: `${BUSINESS.website}/locations/${area.slug}` },
        ]}
      />
      <CityFAQJsonLd area={area} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AutoDealer",
            name: "Speedway Motors LLC",
            url: `https://www.speedwaymotorsllc.com/locations/${area.slug}`,
            address: {
              "@type": "PostalAddress",
              streetAddress: "302-304 22nd Ave",
              addressLocality: "Paterson",
              addressRegion: "NJ",
              postalCode: "07513",
              addressCountry: "US",
            },
            areaServed: { "@type": "City", name: area.city },
          }),
        }}
      />

      <PageHero
        eyebrow={`Serving ${area.city}, ${area.state}`}
        title={`Used Cars Near ${area.city}`}
        subtitle={`Quality pre-owned vehicles just ${area.distanceMiles} miles from ${area.city}. 180+ cars, SUVs, and trucks with financing for all credit levels.`}
      />

      {/* About Section */}
      <SectionWrapper background="charcoal">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">
            Used Car Dealership Near {area.city}, {area.state}
          </h2>
          <div className="space-y-4 text-zinc-400 leading-relaxed">
            <p>{area.description}</p>
            <p>
              {area.city} residents choose Speedway Motors because we make buying a used car simple and stress-free.
              With over {BUSINESS.stats.vehiclesInStock} vehicles in stock from {BUSINESS.stats.brandsCarried}+ brands,
              you&apos;ll find sedans, SUVs, trucks, and vans to fit every need and budget. Our team is dedicated
              to providing transparent pricing with no hidden fees.
            </p>
            <p>
              Financing shouldn&apos;t be a barrier to getting a reliable vehicle. Whether you have excellent credit,
              are rebuilding your credit, or are a first-time buyer, our finance team works with multiple NJ lenders
              to find you a competitive rate. Most applications are approved the same day.
            </p>
          </div>
        </div>
      </SectionWrapper>

      {/* Popular Vehicles */}
      {vehicles.length > 0 && (
        <SectionWrapper background="dark">
          <SectionHeading
            eyebrow="Featured Selection"
            title={`Popular Vehicles for ${area.city} Drivers`}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {vehicles.map((v, i) => {
              const estMonthly = v.estimatedPayment || estimateMonthlyPayment(v.price);
              return (
                <AnimateIn key={v.id} delay={i * 80} variant="up">
                  <Link
                    href={`/inventory/${v.slug}`}
                    className="group block rounded-xl border border-white/5 bg-[#101010] transition-all duration-300 hover:-translate-y-[5px] hover:border-white/15 hover:shadow-[0_18px_36px_-14px_rgba(0,0,0,0.75)]"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden rounded-t-xl">
                      <VehicleImage
                        src={v.images[0]?.url}
                        alt={`Used ${v.year} ${v.make} ${v.model} for sale near ${area.city} NJ — Speedway Motors`}
                        make={v.make}
                        model={v.model}
                        className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    </div>
                    <div className="p-4 pb-5">
                      <h3 className="text-base font-semibold text-white">
                        {v.year} {v.make} {v.model}
                      </h3>
                      {v.trim && <p className="text-sm text-zinc-500 mt-0.5">{v.trim}</p>}
                      <div className="mt-2">
                        <span className="text-xl font-bold text-accent-light">{formatPrice(v.price)}</span>
                        <span className="block text-xs text-zinc-500 mt-0.5">Est. ${estMonthly}/mo</span>
                      </div>
                      <div className="mt-4 flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 bg-white/[0.04] border border-white/[0.06] rounded-full px-2.5 py-1">
                          <Gauge className="h-3 w-3" />{formatMileage(v.mileage)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 bg-white/[0.04] border border-white/[0.06] rounded-full px-2.5 py-1">
                          <Fuel className="h-3 w-3" />{v.fuelType || "Gas"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 bg-white/[0.04] border border-white/[0.06] rounded-full px-2.5 py-1">
                          <Cog className="h-3 w-3" />{v.drivetrain || "FWD"}
                        </span>
                      </div>
                    </div>
                  </Link>
                </AnimateIn>
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <Button href="/inventory" variant="outline" size="lg" className="uppercase tracking-[0.08em]">
              View All Inventory <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </SectionWrapper>
      )}

      {/* Why Choose Us */}
      <SectionWrapper background="elevated">
        <SectionHeading
          eyebrow="Why Us"
          title={`Why ${area.city} Drivers Choose Speedway Motors`}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {valuePros.map((vp, i) => {
            const Icon = vp.icon;
            return (
              <AnimateIn key={vp.title} delay={i * 100} variant="up">
                <div className="card-glass p-7 text-center h-full">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/15 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-5 w-5 text-accent-light" />
                  </div>
                  <h3 className="font-semibold text-white text-lg mb-2">{vp.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{vp.description}</p>
                </div>
              </AnimateIn>
            );
          })}
        </div>
      </SectionWrapper>

      {/* Directions */}
      <SectionWrapper background="dark">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start gap-4 p-6 rounded-xl bg-surface-1 border border-white/[0.06]">
            <MapPin className="h-5 w-5 text-accent-light flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white mb-2">Directions from {area.city}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                From {area.city}, head toward Paterson to reach our showroom at 302-304 22nd Ave, Paterson, NJ 07513.
                We&apos;re just {area.distanceMiles} miles away — typically a {Math.max(5, area.distanceMiles * 3)}-minute drive.
                Free parking available on-site.
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* FAQ */}
      <SectionWrapper background="elevated">
        <SectionHeading
          eyebrow="FAQ"
          title={`Questions from ${area.city} Shoppers`}
        />
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question} className="rounded-xl border border-white/[0.08] bg-surface-1 p-5">
              <h3 className="font-semibold text-white text-sm mb-2">{faq.question}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* CTA */}
      <SectionWrapper background="dark">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Find Your Next Vehicle?
          </h2>
          <p className="text-zinc-400 mb-6">
            Browse our full inventory online or visit us in Paterson. We&apos;re open Monday–Saturday.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button href="/inventory" variant="primary" size="lg">
              Browse Inventory <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="/finance" variant="outline" size="lg">
              Get Pre-Approved
            </Button>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
