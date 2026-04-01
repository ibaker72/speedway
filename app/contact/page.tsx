import { Phone, Mail, Clock, MapPin, ArrowRight } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { ContactForm } from "@/components/forms/ContactForm";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { BUSINESS, HOURS } from "@/lib/constants";
import { locations } from "@/lib/data/locations";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Speedway Motors — Paterson, NJ",
  description:
    "Contact Speedway Motors at (862) 264-2777 or visit us at 302-304 22nd Ave, Paterson, NJ 07513. Open Mon-Sat 9:30 AM - 7:00 PM.",
  alternates: {
    canonical: "https://www.speedwaymotorsllc.com/contact",
  },
};

const typeLabels: Record<string, string> = {
  showroom: "Main Showroom",
  commercial: "Commercial Department",
  branch: "Branch Location",
};

const contactMethods = [
  {
    icon: Phone,
    title: "Call Us",
    value: BUSINESS.phone,
    href: BUSINESS.phoneHref,
    sub: `Fax: ${BUSINESS.fax}`,
  },
  {
    icon: Mail,
    title: "Email Us",
    value: BUSINESS.email,
    href: `mailto:${BUSINESS.email}`,
  },
  {
    icon: Clock,
    title: "Hours",
    value: "Mon\u2013Sat 9:30 AM \u2013 7:00 PM",
    sub: "Closed Sunday",
  },
];

export default function ContactPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", url: `${BUSINESS.website}/` }, { name: "Contact", url: `${BUSINESS.website}/contact` }]} />
      <PageHero
        eyebrow="Get in Touch"
        title="Contact Speedway Motors — Paterson, NJ"
        subtitle="We'd love to hear from you. Reach out by phone, email, or visit us in person."
      />

      <SectionWrapper background="charcoal">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {contactMethods.map((m, i) => {
            const Icon = m.icon;
            return (
              <AnimateIn key={m.title} delay={i * 100} variant="up">
                <div className="card-glass p-7 text-center h-full">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-accent/10 border border-accent/15 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-accent-light" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{m.title}</h3>
                  {m.href ? (
                    <a
                      href={m.href}
                      className="text-sm text-zinc-300 hover:text-accent-light transition-colors break-all"
                    >
                      {m.value}
                    </a>
                  ) : (
                    <p className="text-sm text-zinc-300">{m.value}</p>
                  )}
                  {m.sub && (
                    <p className="text-xs text-zinc-500 mt-1">{m.sub}</p>
                  )}
                </div>
              </AnimateIn>
            );
          })}
        </div>
      </SectionWrapper>

      {/* Contact Form */}
      <SectionWrapper background="elevated">
        <div className="max-w-2xl mx-auto">
          <ContactForm />
        </div>
      </SectionWrapper>

      <SectionWrapper background="dark">
        <h2 className="text-2xl font-bold text-center text-white mb-8">
          Our Locations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {locations.map((loc, i) => (
            <AnimateIn key={loc.id} delay={i * 100} variant="up">
              <div className="card-glass p-7 h-full">
                <span className="badge-accent text-[10px] mb-4 inline-block">
                  {typeLabels[loc.type]}
                </span>
                <div className="space-y-2.5 text-sm text-zinc-300">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-zinc-500" />
                    <span>
                      {loc.address}, {loc.city}, {loc.state} {loc.zip}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 flex-shrink-0 text-zinc-500" />
                    <a
                      href={loc.phoneHref}
                      className="hover:text-accent-light transition-colors"
                    >
                      {loc.phone}
                    </a>
                  </div>
                </div>
                <a
                  href={loc.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-accent-light hover:text-white transition-colors"
                >
                  Get Directions
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </AnimateIn>
          ))}
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/[0.06] h-[400px] bg-surface-1">
          <iframe
            src="https://www.google.com/maps?q=302+22nd+Ave,+Paterson,+NJ+07513&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Speedway Motors Location"
          />
        </div>

        <div className="mt-12 max-w-md mx-auto">
          <h3 className="text-lg font-bold text-center text-white mb-4">
            Showroom Hours
          </h3>
          <div className="rounded-2xl border border-white/[0.06] bg-surface-1 overflow-hidden">
            {HOURS.map((h) => (
              <div
                key={h.day}
                className="flex justify-between px-5 py-3.5 text-sm border-b border-white/[0.04] last:border-b-0"
              >
                <span className="text-zinc-500">{h.day}</span>
                <span
                  className={`font-medium ${
                    h.open === "Closed" ? "text-zinc-600" : "text-white"
                  }`}
                >
                  {h.open === "Closed" ? "Closed" : `${h.open} \u2013 ${h.close}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
