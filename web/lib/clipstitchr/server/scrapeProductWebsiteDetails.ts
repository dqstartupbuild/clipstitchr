import { createProductWebsiteDetailsText } from "@/lib/clipstitchr/server/createProductWebsiteDetailsText";
import { startFirecrawlProductWebsiteCrawl } from "@/lib/clipstitchr/server/startFirecrawlProductWebsiteCrawl";
import { waitForFirecrawlProductWebsiteCrawl } from "@/lib/clipstitchr/server/waitForFirecrawlProductWebsiteCrawl";

export async function scrapeProductWebsiteDetails(url: string) {
  const crawlId = await startFirecrawlProductWebsiteCrawl(url);
  const crawlStatus = await waitForFirecrawlProductWebsiteCrawl(crawlId);
  const details = createProductWebsiteDetailsText(crawlStatus.data ?? [], url);

  if (!details) {
    throw new Error("Firecrawl did not return readable website details.");
  }

  return details;
}
