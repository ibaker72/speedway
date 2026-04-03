import { BadgeCheck, HandCoins, CarFront, CalendarClock } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { SectionWrapper } from "@/components/shared/SectionWrapper";

const trustItems = [
  {
    icon: BadgeCheck,
    title: "Transparent pricing",
    description: "Clear numbers, straightforward walkthroughs, and no fabricated urgency.",
  },
  {
    icon: HandCoins,
    title: "Financing guidance",
    description: "Work through lender options and monthly payment ranges with support.",
  },
  {
    icon: CarFront,
    title: "Trade-in support",
    description: "Bring your current vehicle for an appraisal and apply value to your purchase.",
  },
  {
    icon: CalendarClock,
    title: "Convenient test drives",
    description: "Schedule ahead online and confirm vehicle availability before you visit.",
  },
];

export function LocationTrustSection({ city }: { city: string }) {
  return (
    <SectionWrapper background="elevated">
      <SectionHeading eyebrow="Why Speedway" title={`Why ${city} shoppers choose Speedway Motors`} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {trustItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="card-glass p-5">
              <Icon className="h-5 w-5 text-accent-light mb-3" />
              <h3 className="font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-zinc-400">{item.description}</p>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
