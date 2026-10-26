import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { buildAutoDealerJsonLd, buildFaqJsonLd, type FaqItem } from "@/lib/seo/schema";

/** Site-wide dealership entity, rendered once from the root layout. */
export function AutoDealerJsonLd() {
  return <JsonLdScript data={buildAutoDealerJsonLd()} />;
}

/** FAQPage markup. Only render it on a page that visibly shows these same questions and answers. */
export function FAQPageJsonLd({ faqs }: { faqs: FaqItem[] }) {
  if (!faqs.length) return null;
  return <JsonLdScript data={buildFaqJsonLd(faqs)} />;
}
