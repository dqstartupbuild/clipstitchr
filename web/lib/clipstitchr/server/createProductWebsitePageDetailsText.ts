import { productWebsitePageMarkdownMaxLength } from "@/lib/clipstitchr/constants/productWebsitePageMarkdownMaxLength";
import { normalizeFirecrawlLinks } from "@/lib/clipstitchr/server/normalizeFirecrawlLinks";
import { normalizeFirecrawlText } from "@/lib/clipstitchr/server/normalizeFirecrawlText";
import type { FirecrawlScrapeData } from "@/lib/clipstitchr/types/FirecrawlScrapeData";

export function createProductWebsitePageDetailsText(
  data: FirecrawlScrapeData,
  requestedUrl: string,
) {
  const title = normalizeFirecrawlText(data.metadata?.title);
  const description = normalizeFirecrawlText(data.metadata?.description);
  const keywords = normalizeFirecrawlText(data.metadata?.keywords);
  const sourceUrl = normalizeFirecrawlText(
    data.metadata?.sourceURL || data.metadata?.url,
  );
  const summary = normalizeFirecrawlText(data.summary);
  const markdown = normalizeFirecrawlText(data.markdown).slice(
    0,
    productWebsitePageMarkdownMaxLength,
  );
  const links = normalizeFirecrawlLinks(data.links);

  return [
    `Website URL: ${sourceUrl || requestedUrl}`,
    title ? `Page title: ${title}` : "",
    description ? `Page description: ${description}` : "",
    keywords ? `Page keywords: ${keywords}` : "",
    summary ? `Page summary: ${summary}` : "",
    links.length ? `Page links:\n${links.join("\n")}` : "",
    markdown ? `Page content:\n${markdown}` : "",
  ]
    .filter(Boolean)
    .join("\n\n")
    .trim();
}
