"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageCircle,
  X,
  Search,
  DollarSign,
  ArrowRightLeft,
  Phone,
  Mail,
  BookOpen,
} from "lucide-react";
import { BUSINESS } from "@/lib/constants";

const quickActions = [
  {
    icon: Search,
    label: "Browse Inventory",
    href: "/inventory",
    description: "View 180+ vehicles",
  },
  {
    icon: DollarSign,
    label: "Get Financing Help",
    href: "/finance",
    description: "All credit levels welcome",
  },
  {
    icon: ArrowRightLeft,
    label: "Value My Trade",
    href: "/trade",
    description: "Get an instant estimate",
  },
  {
    icon: BookOpen,
    label: "Free Buying Guide",
    href: "/guides/car-buying-guide",
    description: "Tips before you buy",
  },
  {
    icon: Phone,
    label: "Call Sales",
    href: BUSINESS.phoneHref,
    description: BUSINESS.phone,
    external: true,
  },
  {
    icon: Mail,
    label: "Contact Us",
    href: "/contact",
    description: "Send us a message",
  },
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[340px] max-w-[calc(100vw-2rem)] animate-[scaleIn_0.3s_cubic-bezier(0.16,1,0.3,1)]">
          <div className="bg-surface-2 border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-accent px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-white font-semibold text-sm">
                  Need help finding the right vehicle?
                </p>
                <p className="text-white/70 text-xs mt-0.5">
                  We&apos;re here to help
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white p-1 transition-colors"
                aria-label="Close help panel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick actions */}
            <div className="p-3 space-y-1">
              {quickActions.map((action) => {
                const Icon = action.icon;
                const Component = action.external ? "a" : Link;
                const extraProps = action.external
                  ? { href: action.href }
                  : { href: action.href };
                return (
                  <Component
                    key={action.label}
                    {...extraProps}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/[0.04] transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                      <Icon className="h-4 w-4 text-zinc-400 group-hover:text-accent-light transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{action.label}</p>
                      <p className="text-xs text-zinc-500">{action.description}</p>
                    </div>
                  </Component>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-white/[0.06] text-center">
              <p className="text-[11px] text-zinc-600">
                Mon–Sat 9:30 AM – 7:00 PM
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating trigger button — hidden on mobile (StickyMobileCTA is used instead) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 hidden lg:flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 ${
          isOpen
            ? "bg-surface-3 border border-white/[0.1] text-zinc-400 hover:text-white"
            : "bg-accent text-white hover:bg-accent-light shadow-[0_4px_24px_rgba(196,18,48,0.4)] hover:shadow-[0_6px_32px_rgba(196,18,48,0.5)] animate-[pulseGlow_3s_ease-in-out_infinite]"
        }`}
        aria-label={isOpen ? "Close help" : "Get help"}
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}
      </button>
    </>
  );
}
