import { Phone, Mail, Clock, MapPin, ArrowRight } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { BUSINESS, HOURS } from "@/lib/constants";
import { locations } from "@/lib/data/locations";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Speedway Motors LLC in Paterson, NJ. Call (862) 264-2777, email us, or visit one of our three locations.",
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
    value: "Mon–Sat 9:30 AM – 7:00 PM",
    sub: "Closed Sunday",
  },
];

export default function ContactPage() {
  return (
    <>
      <SectionWrapper background="charcoal" className="py-14 md:py-20">
        <SectionHeading
          title="Contact Us"
          subtitle="We'd love to hear from you. Reach out by phone, email, or visit us in person."
          as="h1"
          label="Get in Touch"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {contactMethods.map((m, i) => (
            <AnimateIn key={m.title} delay={i * 100} variant="up">
              <div className="premium-card p-7 text-center h-full">
                <div className="w-12 h-12 mx-auto rounded-xl bg-accent/10 border border-accent/10 flex items-center justify-center mb-4">
                  <m.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-semibold text-white mb-2">{m.title}</h3>
                {m.href ? (
                  <a
                    href={m.href}
                    className="text-sm text-zinc-300 hover:text-accent transition-colors break-all"
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
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper background="light">
        <h2 className="text-2xl font-display text-center mb-8">
          Our Locations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {locations.map((loc, i) => (
            <AnimateIn key={loc.id} delay={i * 100} variant="up">
              <div className="rounded-2xl border border-zinc-200/80 p-7 bg-white hover:shadow-md transition-all duration-300 h-full">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent mb-4">
                  {typeLabels[loc.type]}
                </div>
                <div className="space-y-2.5 text-sm text-zinc-600">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-zinc-400" />
                    <span>
                      {loc.address}, {loc.city}, {loc.state} {loc.zip}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 flex-shrink-0 text-zinc-400" />
                    <a
                      href={loc.phoneHref}
                      className="hover:text-red-700 transition-colors"
                    >
                      {loc.phone}
                    </a>
                  </div>
                </div>
                <a
                  href={loc.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-red-700 hover:text-red-800 transition-colors"
                >
                  Get Directions
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </AnimateIn>
          ))}
        </div>

        <div className="rounded-2xl overflow-hidden border border-zinc-200/80 shadow-sm">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3015.8!2d-74.1718!3d40.9168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s302+22nd+Ave+Paterson+NJ+07513!5e0!3m2!1sen!2sus!4v1"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Speedway Motors Location"
          />
        </div>

        <div className="mt-10 max-w-md mx-auto">
          <h3 className="text-lg font-display text-center mb-4">
            Showroom Hours
          </h3>
          <div className="rounded-2xl border border-zinc-200/80 bg-white overflow-hidden shadow-sm">
            {HOURS.map((h) => (
              <div
                key={h.day}
                className="flex justify-between px-5 py-3.5 text-sm border-b border-zinc-100 last:border-b-0"
              >
                <span className="text-zinc-500">{h.day}</span>
                <span
                  className={`font-medium ${h.open === "Closed" ? "text-zinc-400" : "text-zinc-900"}`}
                >
                  {h.open === "Closed" ? "Closed" : `${h.open} – ${h.close}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
