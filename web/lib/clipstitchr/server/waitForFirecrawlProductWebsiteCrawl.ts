import { productWebsiteCrawlPollIntervalMs } from "@/lib/clipstitchr/constants/productWebsiteCrawlPollIntervalMs";
import { productWebsiteCrawlTimeoutMs } from "@/lib/clipstitchr/constants/productWebsiteCrawlTimeoutMs";
import { fetchFirecrawlCrawlStatus } from "@/lib/clipstitchr/server/fetchFirecrawlCrawlStatus";
import { getFirecrawlCrawlStatusHasData } from "@/lib/clipstitchr/server/getFirecrawlCrawlStatusHasData";
import { getFirecrawlCrawlStatusIsTerminal } from "@/lib/clipstitchr/server/getFirecrawlCrawlStatusIsTerminal";
import { waitForMilliseconds } from "@/lib/clipstitchr/utils/waitForMilliseconds";
import type { FirecrawlCrawlStatusResponse } from "@/lib/clipstitchr/types/FirecrawlCrawlStatusResponse";

export async function waitForFirecrawlProductWebsiteCrawl(crawlId: string) {
  const startedAt = Date.now();
  let latestStatus: FirecrawlCrawlStatusResponse | null = null;

  while (Date.now() - startedAt < productWebsiteCrawlTimeoutMs) {
    latestStatus = await fetchFirecrawlCrawlStatus(crawlId);

    if (getFirecrawlCrawlStatusIsTerminal(latestStatus)) {
      if (getFirecrawlCrawlStatusHasData(latestStatus)) {
        return latestStatus;
      }

      throw new Error("Firecrawl did not return readable website details.");
    }

    await waitForMilliseconds(productWebsiteCrawlPollIntervalMs);
  }

  if (latestStatus && getFirecrawlCrawlStatusHasData(latestStatus)) {
    return latestStatus;
  }

  throw new Error("Firecrawl website import timed out before any pages were ready.");
}
