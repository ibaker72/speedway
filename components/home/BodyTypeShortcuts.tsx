import Link from "next/link";
import { Car, Truck, CircleDot, Bus, Crown, ArrowRight } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { AnimateIn } from "@/components/shared/AnimateIn";

const bodyTypes = [
  {
    label: "Sedans",
    icon: Car,
    href: "/inventory?type=sedan",
    count: "40+",
    description: "Efficient & refined",
  },
  {
    label: "SUVs",
    icon: CircleDot,
    href: "/inventory?type=suv",
    count: "45+",
    description: "Space & capability",
  },
  {
    label: "Trucks",
    icon: Truck,
    href: "/inventory?type=truck",
    count: "25+",
    description: "Power & utility",
  },
  {
    label: "Vans",
    icon: Bus,
    href: "/inventory?type=van",
    count: "15+",
    description: "Family & cargo",
  },
  {
    label: "Luxury",
    icon: Crown,
    href: "/inventory?type=luxury",
    count: "20+",
    description: "Premium selection",
  },
];

export function BodyTypeShortcuts() {
  return (
    <SectionWrapper background="dark">
      <SectionHeading
        eyebrow="Browse by Category"
        title="Shop by Body Type"
        subtitle="Find the right vehicle for your lifestyle."
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
        {bodyTypes.map((type, i) => {
          const Icon = type.icon;
          return (
            <AnimateIn key={type.label} delay={i * 60} variant="scale">
              <Link
                href={type.href}
                className="group flex flex-col items-center gap-5 p-6 lg:p-8 rounded-2xl border border-white/6 bg-white/2 hover:bg-white/5 hover:border-accent/30 transition-all duration-300 h-full"
              >
                {/* Icon container */}
                <div className="w-16 h-16 rounded-2xl bg-white/4 border border-white/6 group-hover:bg-accent/10 group-hover:border-accent/20 flex items-center justify-center transition-all duration-300">
                  <Icon className="h-7 w-7 text-zinc-500 group-hover:text-accent-light transition-colors duration-300" />
                </div>

                <div className="text-center">
                  <div className="font-semibold text-white text-sm">
                    {type.label}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">
                    {type.count} available
                  </div>
                  <div className="text-[10px] text-zinc-600 mt-0.5 hidden sm:block">
                    {type.description}
                  </div>
                </div>

                {/* Hover arrow */}
                <ArrowRight className="h-4 w-4 text-zinc-700 group-hover:text-accent-light opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0" />
              </Link>
            </AnimateIn>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
