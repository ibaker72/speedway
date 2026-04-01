import { PageHero } from "@/components/shared/PageHero";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { BUSINESS } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Team",
  description:
    "Meet the Speedway Motors family. Our experienced team is here to help you find the perfect vehicle.",
  alternates: {
    canonical: "https://www.speedwaymotorsllc.com/team",
  },
};

const teamMembers = [
  {
    name: "Ali Hassan",
    role: "Owner & General Manager",
    initials: "AH",
    bio: "With over 20 years in the automotive industry, Ali founded Speedway Motors with a simple mission: honest deals and happy customers. He personally oversees every aspect of the dealership.",
  },
  {
    name: "Mike Rivera",
    role: "Sales Manager",
    initials: "MR",
    bio: "Mike brings 12 years of automotive sales experience and a passion for matching customers with their perfect vehicle. He leads our sales team with integrity and dedication.",
  },
  {
    name: "Sarah Chen",
    role: "Finance Manager",
    initials: "SC",
    bio: "Sarah works with a network of lenders to find the best financing options for every credit situation. She makes the numbers work so you can drive home happy.",
  },
  {
    name: "Carlos Martinez",
    role: "Service Advisor",
    initials: "CM",
    bio: "Carlos ensures every vehicle meets our quality standards before it reaches the lot. His mechanical expertise and attention to detail give our customers peace of mind.",
  },
];

export default function TeamPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: `${BUSINESS.website}/` },
          { name: "Our Team", url: `${BUSINESS.website}/team` },
        ]}
      />
      <PageHero
        eyebrow="Our Team"
        title="Meet the Speedway Family"
        subtitle="Dedicated professionals committed to making your car-buying experience exceptional."
      />

      <SectionWrapper background="charcoal">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {teamMembers.map((member, i) => (
            <AnimateIn key={member.name} delay={i * 100} variant="up">
              <div className="card-glass p-6 text-center h-full">
                <div className="w-20 h-20 mx-auto rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-5">
                  <span className="text-xl font-bold text-accent-light">
                    {member.initials}
                  </span>
                </div>
                <h3 className="font-semibold text-white text-lg">{member.name}</h3>
                <p className="text-sm text-accent-light font-medium mt-1 mb-4">
                  {member.role}
                </p>
                <p className="text-sm text-zinc-400 leading-relaxed">{member.bio}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </SectionWrapper>
    </>
  );
}
