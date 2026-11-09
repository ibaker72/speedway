"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarCheck, DollarSign, MessageSquare, Phone, Truck, X } from "lucide-react";
import { ShippingInquiryForm } from "@/components/forms/ShippingInquiryForm";
import { VehicleInquiryForm, type InquiryVehicle } from "@/components/inventory/vdp/VehicleInquiryForm";
import { cn } from "@/lib/utils";

type Mode = "availability" | "question" | "financing" | "shipping";

const PANEL_TITLES: Record<Mode, string> = {
  availability: "Check availability",
  question: "Ask a question",
  financing: "Get financing information",
  shipping: "Request a shipping quote",
};

const PANEL_ID = "vdp-inquiry-panel";

const secondary =
  "flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 px-3 py-2.5 text-sm font-semibold leading-tight text-white text-center transition-colors hover:bg-white/6 hover:border-white/25 active:bg-white/8 aria-expanded:border-accent aria-expanded:bg-accent/10";

export function VehicleLeadActions({
  vehicle,
  phone,
  phoneHref,
  shippingEnabled,
}: {
  vehicle: InquiryVehicle;
  phone: string;
  phoneHref: string;
  shippingEnabled: boolean;
}) {
  const [mode, setMode] = useState<Mode | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!mode) return;
    headingRef.current?.focus();
    headingRef.current?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
  }, [mode]);

  const toggle = (next: Mode) => setMode((current) => (current === next ? null : next));
  const controls = (m: Mode) => ({ "aria-expanded": mode === m, "aria-controls": PANEL_ID, onClick: () => toggle(m) });

  return (
    <div id="vehicle-actions" className="space-y-2">
      <button
        type="button"
        {...controls("availability")}
        data-track-cta="vdp_check_availability"
        className="flex w-full min-h-12 items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_2px_12px_rgba(211,17,25,0.3)] transition-colors hover:bg-accent-light active:bg-accent-dark"
      >
        <CalendarCheck className="h-4 w-4" aria-hidden="true" />
        Check Availability
      </button>
      <div className="grid grid-cols-2 gap-2">
        <a href={phoneHref} data-track-cta="vdp_call" className={secondary} aria-label={`Call dealership at ${phone}`}>
          <Phone className="h-4 w-4 shrink-0 text-accent-light" aria-hidden="true" />
          Call Dealership
        </a>
        <button type="button" {...controls("question")} data-track-cta="vdp_ask_question" className={secondary}>
          <MessageSquare className="h-4 w-4 shrink-0 text-accent-light" aria-hidden="true" />
          Ask a Question
        </button>
        <button
          type="button"
          {...controls("financing")}
          data-track-cta="vdp_financing_info"
          className={cn(secondary, !shippingEnabled && "col-span-2")}
        >
          <DollarSign className="h-4 w-4 shrink-0 text-accent-light" aria-hidden="true" />
          Get Financing Information
        </button>
        {shippingEnabled && (
          <button type="button" {...controls("shipping")} data-track-cta="vdp_shipping_quote" className={secondary}>
            <Truck className="h-4 w-4 shrink-0 text-accent-light" aria-hidden="true" />
            Request Shipping Quote
          </button>
        )}
      </div>

      <div id={PANEL_ID} role="region" aria-labelledby={mode ? `${PANEL_ID}-title` : undefined} hidden={!mode}>
        {mode && (
          <div className="mt-3 rounded-xl border border-white/10 bg-surface-1 p-4 sm:p-5">
            <div className="mb-3 flex items-start justify-between gap-3">
              <h2 id={`${PANEL_ID}-title`} ref={headingRef} tabIndex={-1} className="text-base font-bold text-white outline-none">
                {PANEL_TITLES[mode]}
              </h2>
              <button
                type="button"
                onClick={() => setMode(null)}
                className="-m-1 rounded-lg p-1 text-zinc-500 hover:text-white"
                aria-label="Close form"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            {mode === "shipping" ? (
              <>
                <p className="mb-3 text-sm text-zinc-400">
                  Tell us where it&apos;s going. Our team reviews the route and replies with shipping options and an estimate —
                  no rate is quoted automatically.
                </p>
                <ShippingInquiryForm vehicle={vehicle} compact />
              </>
            ) : (
              <VehicleInquiryForm key={mode} type={mode} vehicle={vehicle} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
