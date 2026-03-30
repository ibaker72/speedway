import { cn } from "@/lib/utils";
import { AnimateIn } from "./AnimateIn";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2" | "h3";
  accent?: boolean;
  gradient?: boolean;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
  as: Tag = "h2",
  accent = false,
  gradient = false,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-12 md:mb-16",
        align === "center" && "text-center",
        accent && align === "left" && "flex gap-5",
        className
      )}
    >
      {accent && align === "left" && (
        <div className="w-[3px] shrink-0 self-stretch bg-accent rounded-full" aria-hidden="true" />
      )}
      <div>
        {eyebrow && (
          <AnimateIn as="span" variant="up" className="inline-block mb-4 text-[11px] font-semibold tracking-[0.2em] uppercase text-accent-light">
            {eyebrow}
          </AnimateIn>
        )}
        <AnimateIn as={Tag} variant="up" delay={80}
          className={cn(
            "heading-luxe text-3xl font-bold sm:text-4xl lg:text-[2.75rem] xl:text-5xl leading-[1.1]",
            align === "center" && "mx-auto",
            gradient && "text-gradient-subtle"
          )}
        >
          {title}
        </AnimateIn>
        {subtitle && (
          <AnimateIn
            as="p"
            variant="up"
            delay={140}
            className={cn(
              "mt-5 text-base sm:text-lg max-w-xl leading-relaxed text-zinc-400",
              align === "center" && "mx-auto"
            )}
          >
            {subtitle}
          </AnimateIn>
        )}
      </div>
    </div>
  );
}
