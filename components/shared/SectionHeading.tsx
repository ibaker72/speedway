import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2" | "h3";
}

export function SectionHeading({
  title,
  subtitle,
  align = "center",
  className,
  as: Tag = "h2",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-10 md:mb-14",
        align === "center" && "text-center",
        className
      )}
    >
      <Tag
        className={cn(
          "text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] leading-tight",
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
