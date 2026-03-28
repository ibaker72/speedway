"use client";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

interface AnimateInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: "up" | "left" | "right" | "scale" | "fade";
}

const variants = {
  up: { hidden: "opacity-0 translate-y-4", visible: "opacity-100 translate-y-0" },
  left: { hidden: "opacity-0 -translate-x-4", visible: "opacity-100 translate-x-0" },
  right: { hidden: "opacity-0 translate-x-4", visible: "opacity-100 translate-x-0" },
  scale: { hidden: "opacity-0 scale-97", visible: "opacity-100 scale-100" },
  fade: { hidden: "opacity-0", visible: "opacity-100" },
};

export function AnimateIn({
  children,
  className,
  delay = 0,
  variant = "up",
}: AnimateInProps) {
  const { ref, isVisible } = useInView();
  const v = variants[variant];

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-500 ease-out",
        isVisible ? v.visible : v.hidden,
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
