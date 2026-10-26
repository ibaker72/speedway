import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { buildBreadcrumbJsonLd } from "@/lib/seo/schema";

interface BreadcrumbItem {
  name: string;
  /** Absolute URL or site-relative path. */
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  return <JsonLdScript data={buildBreadcrumbJsonLd(items.map((item) => ({ name: item.name, path: item.url })))} />;
}
