import Link from "next/link";
import { Car, Truck, CircleDot, Bus, Crown } from "lucide-react";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { SectionHeading } from "@/components/shared/SectionHeading";

const bodyTypes = [
  { label: "Sedans", icon: Car, href: "/inventory?type=sedan", count: "40+" },
  { label: "SUVs", icon: CircleDot, href: "/inventory?type=suv", count: "45+" },
  { label: "Trucks", icon: Truck, href: "/inventory?type=truck", count: "25+" },
  { label: "Vans", icon: Bus, href: "/inventory?type=van", count: "15+" },
  { label: "Luxury", icon: Crown, href: "/inventory?type=luxury", count: "20+" },
];

export function BodyTypeShortcuts() {
  return (
    <SectionWrapper background="light">
      <SectionHeading
        title="Shop by Body Type"
        subtitle="Find the right vehicle for your lifestyle."
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {bodyTypes.map((type) => (
          <Link
            key={type.label}
            href={type.href}
            className="group flex flex-col items-center gap-3 p-6 bg-white rounded-xl border border-zinc-200 hover:border-red-200 hover:shadow-md transition-all duration-200"
          >
            <div className="w-14 h-14 rounded-full bg-zinc-100 group-hover:bg-red-50 flex items-center justify-center transition-colors">
              <type.icon className="h-6 w-6 text-zinc-600 group-hover:text-red-700 transition-colors" />
            </div>
            <div className="text-center">
              <div className="font-semibold text-zinc-900 text-sm">{type.label}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{type.count} available</div>
            </div>
          </Link>
        ))}
      </div>
    </SectionWrapper>
  );
}
