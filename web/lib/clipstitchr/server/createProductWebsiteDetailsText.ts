import { productWebsiteDetailsMaxLength } from "@/lib/clipstitchr/constants/productWebsiteDetailsMaxLength";
import { createProductWebsitePageDetailsText } from "@/lib/clipstitchr/server/createProductWebsitePageDetailsText";
import type { FirecrawlScrapeData } from "@/lib/clipstitchr/types/FirecrawlScrapeData";

export function createProductWebsiteDetailsText(
  data: FirecrawlScrapeData | FirecrawlScrapeData[],
  requestedUrl: string,
) {
  const pages = Array.isArray(data) ? data : [data];

  return pages
    .map((page, index) =>
      [
        `Website page ${index + 1} of ${pages.length}`,
        createProductWebsitePageDetailsText(page, requestedUrl),
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .filter(Boolean)
    .join("\n\n---\n\n")
    .slice(0, productWebsiteDetailsMaxLength)
    .trim();
}
