"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, DollarSign, CheckCircle } from "lucide-react";

const variants = {
  "buying-guide": {
    icon: BookOpen,
    text: "Free Download: Used Car Buying Checklist — Don\u2019t buy without it.",
    href: "/guides/car-buying-guide",
  },
  "value-tool": {
    icon: DollarSign,
    text: "What\u2019s your car worth? Get a free instant estimate.",
    href: "/value-my-car",
  },
  finance: {
    icon: CheckCircle,
    text: "Get pre-approved in 60 seconds — all credit welcome.",
    href: "/finance",
  },
} as const;

interface InlineLeadCTAProps {
  variant: keyof typeof variants;
}

export function InlineLeadCTA({ variant }: InlineLeadCTAProps) {
  const { icon: Icon, text, href } = variants[variant];

  return (
    <Link
      href={href}
      className="group block rounded-xl border border-white/[0.08] bg-surface-1 px-5 py-4 transition-all duration-300 hover:border-white/[0.15] hover:bg-surface-2"
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-1 self-stretch rounded-full bg-gradient-to-b from-accent to-accent/40" />
        <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/15 flex items-center justify-center flex-shrink-0">
          <Icon className="h-5 w-5 text-accent-light" />
        </div>
        <p className="text-sm text-zinc-300 flex-1 group-hover:text-white transition-colors">
          {text}
        </p>
        <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-accent-light group-hover:translate-x-1 transition-all flex-shrink-0" />
      </div>
    </Link>
  );
}
