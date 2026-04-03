import { Shield, Users, Car, Award } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { BUSINESS } from "@/lib/constants";

const differentiators = [
  {
    icon: Award, // Keeping your original icon
    title: "Driven by Integrity",
    description: "Built on honesty, respect, and reliable customer service — values that guide every transaction.",
  },
  {
    icon: Shield,
    title: `${BUSINESS.stats.yearsInBusiness}+ Years in Business`,
    description: "Serving the Paterson community since 2005 with honest, no-pressure car buying.",
  },
  {
    icon: Users,
    title: `${BUSINESS.stats.customersServed} Customers Served`,
    description: "Thousands of happy customers across Passaic County and beyond trust Speedway Motors.",
  },
  {
    icon: Car,
    title: `${BUSINESS.stats.vehiclesInStock}+ Vehicles in Stock`,
    description: "One of the largest pre-owned selections in northern New Jersey, refreshed weekly.",
  },
];

export function WhyBuySection() {
  return (
    <SectionWrapper background="elevated">
      <AnimateIn variant="up">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-lg bg-surface-2 p-8 md:p-10 border border-white/6">
            <div className="flex items-start gap-5 mb-10">
              <div className="w-0.75 self-stretch bg-accent" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Our Mission</p>
                <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-white">
                 we deliver transparent, no-pressure car buying.
                </h2>
                <p className="mt-5 text-zinc-300 leading-relaxed">
                  Speedway Motors was built on discipline, integrity, and service. As Paterson&apos;s trusted used car dealership, every vehicle is selected with care, every number is clearly presented, and every customer is treated with respect — whether you&apos;re buying your first car or upgrading your daily driver.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {differentiators.map((d) => {
                const Icon = d.icon;
                return (
                  <div key={d.title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="h-5 w-5 text-accent-light" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{d.title}</h3>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{d.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </AnimateIn>
    </SectionWrapper>
  );
}
