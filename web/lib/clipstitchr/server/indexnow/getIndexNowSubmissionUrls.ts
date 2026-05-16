import { getSitemapEntries } from "@/lib/getSitemapEntries";

export function getIndexNowSubmissionUrls(siteUrl: string) {
  const host = new URL(siteUrl).host;
  const urls = Array.from(
    new Set(getSitemapEntries().map((entry) => entry.url)),
  );
  const invalidUrl = urls.find((url) => {
    const parsed = new URL(url);

    return (
      parsed.host !== host ||
      (parsed.protocol !== "http:" && parsed.protocol !== "https:")
    );
  });

  if (invalidUrl) {
    throw new Error(
      `IndexNow can only submit sitemap URLs from ${host}: ${invalidUrl}`,
    );
  }

  return urls;
}
