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
          <AnimateIn key={type.label} delay={i * 80} variant="scale">
            <Link
              href={type.href}
              className="group flex flex-col items-center gap-4 p-6 lg:p-7 rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.06] hover:border-accent/30 transition-all duration-300 h-full"
            >
              <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 group-hover:from-accent/20 group-hover:to-accent/5 flex items-center justify-center transition-all duration-300 border border-white/[0.05] group-hover:border-accent/20 group-hover:shadow-[0_0_20px_rgba(201,152,26,0.1)]">
                <type.icon className="h-6 w-6 lg:h-7 lg:w-7 text-zinc-400 group-hover:text-accent transition-colors duration-300" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-white text-sm tracking-wide">
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
