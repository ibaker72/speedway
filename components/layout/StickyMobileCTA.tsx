"use client";

import Link from "next/link";
import { Phone, Search, MessageCircle } from "lucide-react";
import { BUSINESS } from "@/lib/constants";
import { useEffect, useState } from "react";

export function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/6 shadow-[0_-4px_20px_rgba(0,0,0,0.4)] transition-transform duration-300 ease-out ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex h-[3.25rem]">
        <a
          href={BUSINESS.phoneHref}
          aria-label={`Call Speedway Motors at ${BUSINESS.phone}`}
          className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-white active:bg-white/4 transition-colors border-r border-white/6"
        >
          <Phone className="h-4 w-4 text-accent" />
          Call
        </a>
        <Link
          href="/inventory"
          aria-label="Browse vehicle inventory"
          className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-accent active:bg-accent-dark transition-colors border-r border-white/6"
        >
          <Search className="h-4 w-4" />
          Browse
        </Link>
        <Link
          href="/contact"
          aria-label="Contact us"
          className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-white active:bg-white/4 transition-colors"
        >
          <MessageCircle className="h-4 w-4 text-accent" />
          Chat
        </Link>
      </div>
    </div>
  );
}
