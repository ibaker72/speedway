import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2" | "h3";
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
  as: Tag = "h2",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-12 md:mb-16",
        align === "center" && "text-center",
        className
      )}
    >
      {eyebrow && (
        <span className="inline-block mb-4 text-[11px] font-semibold tracking-[0.2em] uppercase text-accent-light">
          {eyebrow}
        </span>
      )}
      <Tag
        className={cn(
          "text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] xl:text-5xl leading-[1.1]",
          align === "center" && "mx-auto"
        )}
      >
        {title}
      </Tag>
      {subtitle && (
        <p
          className={cn(
            "mt-5 text-base sm:text-lg max-w-2xl leading-relaxed text-zinc-400",
            align === "center" && "mx-auto"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
