import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  background?: "white" | "light" | "dark" | "charcoal";
  id?: string;
}

const bgStyles = {
  white: "bg-white",
  light: "bg-zinc-50",
  dark: "bg-zinc-900 text-white",
  charcoal: "bg-zinc-950 text-white",
};

export function SectionWrapper({
  children,
  className,
  background = "white",
  id,
}: SectionWrapperProps) {
  return (
    <section id={id} className={cn(bgStyles[background], "py-16 md:py-20", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}
