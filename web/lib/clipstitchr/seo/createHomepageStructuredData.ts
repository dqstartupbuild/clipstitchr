import { brandAssets } from "@/lib/brandAssets";
import { createCanonicalUrl, site } from "@/lib/site";

export function createHomepageStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: site.defaultTitle,
        description: site.defaultDescription,
        url: site.url,
        isPartOf: {
          "@type": "WebSite",
          name: site.name,
          url: site.url,
        },
        about: [
          { "@type": "Thing", name: "Mobile app video advertising" },
          { "@type": "Thing", name: "UGC app ads" },
          { "@type": "Thing", name: "Short-form app ads" },
        ],
      },
      {
        "@type": "SoftwareApplication",
        name: site.name,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        description: site.defaultDescription,
        url: site.url,
        image: createCanonicalUrl(brandAssets.openGraphDefault),
        featureList: [
          "Turn UGC clips and product demos into vertical app ads",
          "Prepare ads for TikTok, Instagram Reels, and YouTube Shorts",
          "Organize reusable clips, demos, and finished ad outputs",
        ],
        offers: {
          "@type": "Offer",
          price: "39",
          priceCurrency: "USD",
          category: "monthly subscription",
        },
        publisher: {
          "@type": "Organization",
          name: site.publisherName,
          url: site.url,
        },
      },
    ],
  };
}
