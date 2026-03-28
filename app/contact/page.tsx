import { Phone, Mail, Clock, MapPin } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
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

export default function ContactPage() {
  return (
    <>
      <SectionWrapper background="white">
        <SectionHeading
          title="Contact Us"
          subtitle="We'd love to hear from you. Reach out by phone, email, or visit us in person."
          as="h1"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          <div className="text-center p-6 rounded-xl border border-zinc-200 bg-zinc-50">
            <Phone className="h-6 w-6 mx-auto text-red-700 mb-3" />
            <h3 className="font-semibold text-zinc-900 mb-1">Call Us</h3>
            <a
              href={BUSINESS.phoneHref}
              className="text-sm text-zinc-600 hover:text-red-700 transition-colors"
            >
              {BUSINESS.phone}
            </a>
            <p className="text-xs text-zinc-400 mt-1">
              Fax: {BUSINESS.fax}
            </p>
          </div>
          <div className="text-center p-6 rounded-xl border border-zinc-200 bg-zinc-50">
            <Mail className="h-6 w-6 mx-auto text-red-700 mb-3" />
            <h3 className="font-semibold text-zinc-900 mb-1">Email Us</h3>
            <a
              href={`mailto:${BUSINESS.email}`}
              className="text-sm text-zinc-600 hover:text-red-700 transition-colors break-all"
            >
              {BUSINESS.email}
            </a>
          </div>
          <div className="text-center p-6 rounded-xl border border-zinc-200 bg-zinc-50">
            <Clock className="h-6 w-6 mx-auto text-red-700 mb-3" />
            <h3 className="font-semibold text-zinc-900 mb-1">Hours</h3>
            <p className="text-sm text-zinc-600">Mon–Sat 9:30 AM – 7:00 PM</p>
            <p className="text-xs text-zinc-400 mt-1">Closed Sunday</p>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper background="light">
        <h2 className="text-2xl font-display text-center mb-8">Our Locations</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className="rounded-xl border border-zinc-200 p-6 bg-white"
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-red-600 mb-3">
                {typeLabels[loc.type]}
              </div>
              <div className="space-y-2 text-sm text-zinc-600">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-zinc-400" />
                  <span>
                    {loc.address}, {loc.city}, {loc.state} {loc.zip}
                  </span>
                </div>
                <div className="flex items-center gap-2">
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
                className="inline-block mt-4 text-sm font-semibold text-red-700 hover:text-red-800 transition-colors"
              >
                Get Directions →
              </a>
            </div>
          ))}
        </div>

        {/* Google Maps embed */}
        <div className="rounded-xl overflow-hidden border border-zinc-200">
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

        {/* Hours table */}
        <div className="mt-10 max-w-md mx-auto">
          <h3 className="text-lg font-display text-center mb-4">
            Showroom Hours
          </h3>
          <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
            {HOURS.map((h) => (
              <div
                key={h.day}
                className="flex justify-between px-5 py-3 text-sm border-b border-zinc-100 last:border-b-0"
              >
                <span className="text-zinc-600">{h.day}</span>
                <span className="font-medium text-zinc-900">
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
