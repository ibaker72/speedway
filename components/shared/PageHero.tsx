import { cn } from "@/lib/utils";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
  compact?: boolean;
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  className,
  children,
  compact,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden text-white",
        compact ? "py-16 md:py-20" : "py-20 md:py-28 lg:py-32",
        className
      )}
    >
      {/* Layered background */}
      <div className="absolute inset-0 bg-[#050505]" />
      <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.04] via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[80rem] px-5 sm:px-6 lg:px-8">
        {eyebrow && (
          <span className="inline-block mb-4 text-[11px] font-semibold tracking-[0.2em] uppercase text-accent-light animate-[fadeUp_0.6s_ease-out_forwards]">
            {eyebrow}
          </span>
        )}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] animate-[fadeUp_0.6s_ease-out_0.1s_both]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-5 text-lg sm:text-xl text-zinc-400 max-w-2xl leading-relaxed animate-[fadeUp_0.6s_ease-out_0.2s_both]">
            {subtitle}
          </p>
        )}
        {children && (
          <div className="mt-8 animate-[fadeUp_0.6s_ease-out_0.3s_both]">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
