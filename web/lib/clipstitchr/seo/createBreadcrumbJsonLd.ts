import { createCanonicalUrl } from "@/lib/site";

type BreadcrumbItem = {
  name: string;
  pathname: string;
};

export function createBreadcrumbJsonLd(items: readonly BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: createCanonicalUrl(item.pathname),
    })),
  };
}
