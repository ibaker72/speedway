"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { DealDeskRequestType, DealSnapshot } from "@/lib/deal-desk/types";

interface LeadModalProps {
  requestType: DealDeskRequestType;
  onClose: () => void;
  payload: {
    sessionId: string;
    vehicleId: string;
    vehicleSlug: string;
    stockNumber?: string;
    vehicleTitle: string;
    vehiclePrice: number;
    monthlyEstimateShown: number;
    outTheDoorEstimateShown: number;
    calculatorSnapshot: DealSnapshot;
  };
}

function getUtm() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get("utm_source") || "",
    medium: params.get("utm_medium") || "",
    campaign: params.get("utm_campaign") || "",
    term: params.get("utm_term") || "",
    content: params.get("utm_content") || "",
  };
}

export function DealDeskLeadModal({ requestType, onClose, payload }: LeadModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    try {
      const body = {
        requestType,
        name: formData.get("name"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        preferredContactMethod: formData.get("preferredContactMethod"),
        message: formData.get("message"),
        referralSource: typeof document !== "undefined" ? document.referrer : "",
        utm: getUtm(),
        ...payload,
      };

      const response = await fetch("/api/deal-desk/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("Unable to submit");
      setSuccess(true);
    } catch {
      setError("Unable to submit right now. Please call us.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 p-4 flex items-center justify-center">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-surface-2 p-6">
        {success ? (
          <div className="space-y-4 text-center">
            <h4 className="text-xl font-semibold text-white">Request received</h4>
            <p className="text-sm text-zinc-400">A specialist will contact you shortly.</p>
            <Button className="w-full" onClick={onClose}>Done</Button>
          </div>
        ) : (
          <form action={onSubmit} className="space-y-3">
            <h4 className="text-lg text-white font-semibold">Tell us where to send this estimate</h4>
            <input className="input-dark" name="name" placeholder="Full Name" required />
            <input className="input-dark" name="phone" placeholder="Phone" required />
            <input className="input-dark" name="email" type="email" placeholder="Email" required />
            <select className="select-dark" name="preferredContactMethod" defaultValue="phone">
              <option value="phone">Phone</option>
              <option value="email">Email</option>
              <option value="text">Text</option>
            </select>
            <textarea className="input-dark resize-none" name="message" rows={3} placeholder="Anything else we should know?" />
            {error ? <p className="text-xs text-red-400">{error}</p> : null}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button type="submit" loading={loading}>Submit Request</Button>
              <Button type="button" variant="ghost" onClick={onClose}>Continue Without Submitting</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
