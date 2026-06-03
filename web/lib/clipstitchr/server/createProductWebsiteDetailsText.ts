type FirecrawlScrapeData = {
  markdown?: unknown;
  metadata?: {
    description?: unknown;
    sourceURL?: unknown;
    title?: unknown;
    url?: unknown;
  };
  summary?: unknown;
};

const PRODUCT_WEBSITE_MARKDOWN_MAX_LENGTH = 5000;

function normalizeFirecrawlText(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\n{3,}/g, "\n\n") : "";
}

export function createProductWebsiteDetailsText(
  data: FirecrawlScrapeData,
  requestedUrl: string,
) {
  const title = normalizeFirecrawlText(data.metadata?.title);
  const description = normalizeFirecrawlText(data.metadata?.description);
  const sourceUrl = normalizeFirecrawlText(
    data.metadata?.sourceURL || data.metadata?.url,
  );
  const summary = normalizeFirecrawlText(data.summary);
  const markdown = normalizeFirecrawlText(data.markdown).slice(
    0,
    PRODUCT_WEBSITE_MARKDOWN_MAX_LENGTH,
  );

  return [
    `Website URL: ${sourceUrl || requestedUrl}`,
    title ? `Page title: ${title}` : "",
    description ? `Page description: ${description}` : "",
    summary ? `Page summary: ${summary}` : "",
    markdown ? `Page content:\n${markdown}` : "",
  ]
    .filter(Boolean)
    .join("\n\n")
    .trim();
}
