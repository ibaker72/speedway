"use client";

import { useEffect } from "react";
import { captureAttribution, trackEvent } from "@/lib/analytics/track";

/**
 * Site-wide, delegated click tracking so individual links don't need handlers:
 * - tel: links fire `click_to_call`
 * - mailto: links fire `click_email`
 * - elements with data-track-cta="<id>" fire `cta_click`
 * Also records first-touch UTM/landing-page attribution for lead forms.
 */
export function SiteTracking() {
  useEffect(() => {
    captureAttribution();

    function onClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      const pagePath = window.location.pathname;

      const cta = target.closest<HTMLElement>("[data-track-cta]");
      if (cta?.dataset.trackCta) {
        trackEvent("cta_click", { cta_id: cta.dataset.trackCta, page_path: pagePath });
      }

      const link = target.closest<HTMLAnchorElement>("a[href]");
      const href = link?.getAttribute("href") || "";
      if (href.startsWith("tel:")) {
        trackEvent("click_to_call", { page_path: pagePath, link_location: link?.dataset.trackLocation });
      } else if (href.startsWith("mailto:")) {
        trackEvent("click_email", { page_path: pagePath });
      }
    }

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
