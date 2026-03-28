import Link from "next/link";
import { Car, Truck, CircleDot, Bus, Crown } from "lucide-react";
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
        title="Shop by Body Type"
        subtitle="Find the right vehicle for your lifestyle."
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {bodyTypes.map((type, i) => (
          <AnimateIn key={type.label} delay={i * 60} variant="scale">
            <Link
              href={type.href}
              className="group flex flex-col items-center gap-4 p-6 lg:p-7 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-red-500/30 transition-all duration-200 h-full"
            >
              <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-lg bg-zinc-800 group-hover:bg-red-500/10 flex items-center justify-center transition-colors duration-200">
                <type.icon className="h-6 w-6 lg:h-7 lg:w-7 text-zinc-400 group-hover:text-red-500 transition-colors duration-200" />
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
            </Link>
          </AnimateIn>
        ))}
      </div>
    </SectionWrapper>
  );
}
