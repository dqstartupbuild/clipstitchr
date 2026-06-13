import { productWebsiteCrawlPageLimit } from "@/lib/clipstitchr/constants/productWebsiteCrawlPageLimit";

export function createFirecrawlProductWebsiteCrawlBody(url: string) {
  return {
    url,
    limit: productWebsiteCrawlPageLimit,
    crawlEntireDomain: true,
    allowExternalLinks: false,
    allowSubdomains: false,
    ignoreQueryParameters: true,
    maxDiscoveryDepth: 2,
    sitemap: "include",
    maxConcurrency: 3,
    scrapeOptions: {
      formats: ["markdown", "summary", "links"],
      onlyMainContent: true,
      removeBase64Images: true,
      blockAds: true,
      timeout: 60000,
      maxAge: 172800000,
    },
  };
}
