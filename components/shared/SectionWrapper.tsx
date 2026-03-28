import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  background?: "dark" | "charcoal" | "elevated" | "accent" | "gradient";
  id?: string;
  narrow?: boolean;
}

const bgStyles = {
  dark: "bg-[#050505]",
  charcoal: "bg-[#0f0f0f]",
  elevated: "bg-[#161616]",
  accent: "bg-accent text-white",
  gradient: "bg-gradient-to-b from-[#0a0a0a] to-[#0f0f0f]",
};

export function SectionWrapper({
  children,
  className,
  background = "dark",
  id,
  narrow,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn(
        bgStyles[background],
        "py-16 md:py-24 lg:py-28 text-white",
        className
      )}
    >
      <div
        className={cn(
          "relative z-10 mx-auto px-5 sm:px-6 lg:px-8",
          narrow ? "max-w-5xl" : "max-w-[80rem]"
        )}
      >
        {children}
      </div>
    </section>
  );
}
