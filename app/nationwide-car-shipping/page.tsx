import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ClipboardList, FileText, MapPinned, PackageCheck, Phone, Truck } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/button";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { FAQPageJsonLd } from "@/components/seo/JsonLd";
import { ShippingInquiryForm, type ShippingFormVehicle } from "@/components/forms/ShippingInquiryForm";
import { dealerConfig } from "@/dealer.config";
import { BUSINESS } from "@/lib/constants";
import { getVehicleBySlug } from "@/lib/data/inventory-source";
import { formatMileage, formatPrice } from "@/lib/data/vehicles-full";
import { ESTIMATE_REQUIREMENTS, SHIPPING_FAQS, SHIPPING_STEPS } from "@/lib/data/shipping-content";
import { hasPublishedPrice, vehicleName, vehiclePath } from "@/lib/seo/schema";
import { pageMetadata } from "@/lib/seo/metadata";
import type { Vehicle } from "@/lib/types/vehicle";
import type { Metadata } from "next";

const PATH = "/nationwide-car-shipping";

export const metadata: Metadata = pageMetadata({
  title: "Nationwide Vehicle Shipping",
  description:
    "Buying a used vehicle from Speedway Motors in Paterson, NJ but live out of state? Learn how purchase, paperwork, and shipping estimates work, then send a shipping inquiry.",
  path: PATH,
});

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function resolveVehicle(param: string | string[] | undefined): Promise<Vehicle | null> {
  const slug = typeof param === "string" ? param.trim().toLowerCase() : "";
  if (!/^[a-z0-9][a-z0-9-]{0,199}$/.test(slug)) return null;
  try {
    return await getVehicleBySlug(slug);
  } catch {
    return null;
  }
}

const detailSections = [
  {
    icon: FileText,
    title: "Payment & Documentation",
    body: [
      "Before a vehicle is released for transport, the purchase has to be finalized: payment or financing is completed and the sales documents are signed. Our team will explain which documents your purchase requires and how to sign and return them.",
      "Title, registration, and sales tax rules depend on the state where you will register the vehicle. We'll go over what applies to your purchase, and your state's motor vehicle agency can confirm local requirements.",
    ],
  },
  {
    icon: PackageCheck,
    title: "Before Pickup",
    body: [
      "Once the purchase is complete, we confirm the shipping details with you and schedule the vehicle's release for transport.",
      "This is a good time to ask for a final set of photos and the current odometer reading, so you know exactly what to expect at delivery.",
    ],
  },
  {
    icon: MapPinned,
    title: "Delivery Coordination",
    body: [
      "Timing depends on distance, route, transport scheduling, and the type of delivery location. Ask our team who to contact for delivery updates.",
      "When the vehicle arrives, inspect it before signing any delivery paperwork — compare it with the listing photos, check the odometer, and note any concerns on the delivery receipt.",
    ],
  },
];

export default async function NationwideShippingPage({ searchParams }: PageProps) {
  if (!dealerConfig.features.nationwideShipping) notFound();

  const params = await searchParams;
  const vehicle = await resolveVehicle(params.vehicle);
  const formVehicle: ShippingFormVehicle | null = vehicle ? { slug: vehicle.slug, title: vehicleName(vehicle) } : null;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Nationwide Vehicle Shipping", url: PATH },
        ]}
      />
      <FAQPageJsonLd faqs={SHIPPING_FAQS} />

      <PageHero
        eyebrow="Shop Locally. Buy From Anywhere."
        title="Nationwide Vehicle Shipping from Speedway Motors"
        subtitle="Found the right vehicle but live outside North Jersey? Ask our team about shipping options. We'll explain the purchase, paperwork, and delivery steps for your location before you commit."
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <Button href="#shipping-inquiry" variant="primary" size="lg" data-track-cta="shipping_page_hero_inquiry">
            Request a Shipping Estimate
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button href="/inventory" variant="outline" size="lg" data-track-cta="shipping_page_hero_inventory">
            Explore Inventory
          </Button>
        </div>
      </PageHero>

      {/* Direct answer */}
      <SectionWrapper background="charcoal">
        <div className="max-w-3xl mx-auto space-y-5">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Buying a Vehicle From Out of State</h2>
          <p className="text-zinc-300 leading-relaxed text-base md:text-lg">
            You don&apos;t need to live near Paterson, New Jersey to buy from {BUSINESS.shortName}. Out-of-state
            buyers can browse our{" "}
            <Link href="/inventory" className="text-accent-light hover:text-white transition-colors">
              current inventory
            </Link>{" "}
            online, ask questions and request more photos, arrange payment or{" "}
            <Link href="/finance" className="text-accent-light hover:text-white transition-colors">
              financing
            </Link>
            , and ask us about shipping the vehicle to their area.
          </p>
          <p className="text-zinc-400 leading-relaxed">
            Every shipment depends on the vehicle, the destination, and timing, so we don&apos;t publish flat rates or
            fixed delivery dates. Instead, our team reviews your request and confirms the estimate and next steps with
            you before anything is booked.
          </p>
        </div>
      </SectionWrapper>

      {/* Steps */}
      <SectionWrapper background="dark">
        <SectionHeading
          eyebrow="How It Works"
          title="From Browsing to Delivery in Five Steps"
          subtitle="What the process looks like when you buy from out of state."
        />
        <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
          {SHIPPING_STEPS.map((step, i) => (
            <li key={step.title} className="card-glass p-6 h-full">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 border border-accent/20 text-sm font-bold text-accent-light mb-4"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <h3 className="font-semibold text-white mb-2">
                <span className="sr-only">Step {i + 1}: </span>
                {step.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{step.body}</p>
            </li>
          ))}
        </ol>
      </SectionWrapper>

      {/* Estimate requirements + form */}
      <SectionWrapper background="charcoal" id="shipping-inquiry">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 max-w-6xl mx-auto">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <span className="inline-block mb-3 text-[11px] font-semibold tracking-[0.2em] uppercase text-accent-light">
                Shipping Estimates
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white">What We Need to Prepare an Estimate</h2>
            </div>
            <ul className="space-y-3">
              {ESTIMATE_REQUIREMENTS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-zinc-300 leading-relaxed">
                  <ClipboardList className="h-4 w-4 text-accent-light shrink-0 mt-0.5" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>

            {vehicle && (
              <div className="rounded-2xl border border-white/8 bg-surface-1 p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500 mb-2">Vehicle on this inquiry</p>
                <Link
                  href={vehiclePath(vehicle)}
                  className="font-semibold text-white hover:text-accent-light transition-colors"
                >
                  {vehicleName(vehicle)}
                </Link>
                <p className="text-sm text-zinc-400 mt-1">
                  {hasPublishedPrice(vehicle) ? formatPrice(vehicle.price) : "Call for price"} ·{" "}
                  {formatMileage(vehicle.mileage)}
                  {vehicle.stockNumber ? ` · Stock #${vehicle.stockNumber}` : ""}
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-white/8 bg-surface-1 p-5">
              <p className="text-sm text-zinc-400 mb-3">Prefer to talk it through?</p>
              <a
                href={BUSINESS.phoneHref}
                data-track-location="shipping_page"
                className="inline-flex items-center gap-2 text-sm font-semibold text-accent-light hover:text-white transition-colors"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                Call {BUSINESS.phone}
              </a>
            </div>
          </div>

          <div className="lg:col-span-3">
            <ShippingInquiryForm vehicle={formVehicle} />
          </div>
        </div>
      </SectionWrapper>

      {/* Payment, pickup, delivery */}
      <SectionWrapper background="dark">
        <SectionHeading eyebrow="Good to Know" title="Paperwork, Pickup & Delivery" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {detailSections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="card-glass p-7 h-full">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/15 flex items-center justify-center mb-5">
                  <Icon className="h-5 w-5 text-accent-light" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-white text-lg mb-3">{section.title}</h3>
                <div className="space-y-3">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="text-sm text-zinc-400 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </SectionWrapper>

      {/* FAQ */}
      <SectionWrapper background="charcoal">
        <SectionHeading eyebrow="FAQ" title="Vehicle Shipping Questions" />
        <div className="max-w-3xl mx-auto space-y-4">
          {SHIPPING_FAQS.map((faq) => (
            <article key={faq.question} className="rounded-xl border border-white/8 bg-surface-1 p-5">
              <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{faq.answer}</p>
            </article>
          ))}
        </div>
      </SectionWrapper>

      {/* Closing CTA */}
      <SectionWrapper background="elevated">
        <div className="max-w-3xl mx-auto text-center">
          <Truck className="h-8 w-8 text-accent-light mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Start With the Right Vehicle</h2>
          <p className="text-zinc-400 mb-8">
            Browse what&apos;s in stock today, then send us a shipping inquiry from any vehicle page.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button href="/inventory" variant="primary" size="lg" data-track-cta="shipping_page_footer_inventory">
              Explore Inventory
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
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
