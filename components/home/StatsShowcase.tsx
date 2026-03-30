"use client";

import { useInView } from "@/hooks/useInView";
import { useEffect, useState, useRef, useCallback } from "react";
import { Award, Car, Users, Star } from "lucide-react";

const stats = [
  { icon: Award, end: 20, suffix: "+", label: "Years", sublabel: "In Business" },
  { icon: Car, end: 180, suffix: "+", label: "Vehicles", sublabel: "In Stock" },
  { icon: Users, end: 5000, suffix: "+", label: "Customers", sublabel: "Served" },
  { icon: Star, end: 4.8, suffix: "★", label: "Rating", sublabel: "Google Reviews", isDecimal: true },
];

function AnimatedCounter({ end, suffix, isDecimal }: { end: number; suffix: string; isDecimal?: boolean }) {
  const [count, setCount] = useState(0);
  const startedRef = useRef(false);
  const { ref, isVisible } = useInView();

  const animate = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const duration = 2000;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(isDecimal ? parseFloat((eased * end).toFixed(1)) : Math.round(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [end, isDecimal]);

  useEffect(() => {
    if (isVisible) animate();
  }, [isVisible, animate]);

  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>}>
      {isDecimal ? count.toFixed(1) : count.toLocaleString()}{suffix}
    </span>
  );
}

export function StatsShowcase() {
  return (
    <section className="bg-[#050505] py-16 md:py-24 border-t border-white/[0.04] border-b border-b-white/[0.04]">
      <div className="mx-auto max-w-[80rem] px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center">
                <Icon className="h-6 w-6 text-accent mx-auto mb-4 opacity-80" />
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                  <AnimatedCounter end={stat.end} suffix={stat.suffix} isDecimal={stat.isDecimal} />
                </div>
                <p className="mt-2 text-sm font-semibold text-zinc-300">{stat.label}</p>
                <p className="text-xs text-zinc-500">{stat.sublabel}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
