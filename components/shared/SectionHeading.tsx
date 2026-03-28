import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2" | "h3";
  accent?: boolean;
  label?: string;
}

export function SectionHeading({
  title,
  subtitle,
  align = "center",
  className,
  as: Tag = "h2",
  accent = true,
  label = "Speedway Motors",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-10 md:mb-14",
        align === "center" && "text-center",
        className
      )}
    >
      {accent && (
        <div
          className={cn(
            "mb-4 flex items-center gap-3",
            align === "center" && "justify-center"
          )}
        >
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-accent" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
            {label}
          </span>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-accent" />
        </div>
      )}
      <Tag
        className={cn(
          "text-3xl font-display tracking-tight sm:text-4xl lg:text-[2.75rem] leading-tight",
          align === "center" && "mx-auto"
        )}
      >
        {title}
      </Tag>
      {subtitle && (
        <p
          className={cn(
            "mt-4 text-base sm:text-lg max-w-2xl leading-relaxed",
            align === "center" && "mx-auto",
            "text-zinc-500"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
