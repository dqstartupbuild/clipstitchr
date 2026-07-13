import { createCanonicalUrl, site } from "@/lib/site";

type CreateToolWebApplicationJsonLdOptions = {
  description: string;
  name: string;
  pathname: string;
};

export function createToolWebApplicationJsonLd({
  description,
  name,
  pathname,
}: CreateToolWebApplicationJsonLdOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    applicationCategory: "BusinessApplication",
    description,
    name,
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: {
      "@type": "Organization",
      name: site.publisherName,
      url: site.url,
    },
    url: createCanonicalUrl(pathname),
  };
}
