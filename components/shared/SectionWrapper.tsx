import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  background?: "white" | "light" | "dark" | "charcoal" | "accent" | "gradient";
  id?: string;
}

const bgStyles = {
  white: "bg-white",
  light: "pattern-light",
  dark: "mesh-dark text-white grain-overlay relative",
  charcoal: "mesh-charcoal text-white grain-overlay relative",
  accent: "bg-red-700 text-white",
  gradient:
    "bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white grain-overlay relative",
};

export function SectionWrapper({
  children,
  className,
  background = "white",
  id,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn(bgStyles[background], "py-16 md:py-24", className)}
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}
