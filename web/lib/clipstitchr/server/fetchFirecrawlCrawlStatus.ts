import { createFirecrawlRequestHeaders } from "@/lib/clipstitchr/server/createFirecrawlRequestHeaders";
import { getFirecrawlErrorMessage } from "@/lib/clipstitchr/server/getFirecrawlErrorMessage";
import { readFirecrawlJsonResponse } from "@/lib/clipstitchr/server/readFirecrawlJsonResponse";
import type { FirecrawlCrawlStatusResponse } from "@/lib/clipstitchr/types/FirecrawlCrawlStatusResponse";

const FIRECRAWL_CRAWL_ENDPOINT = "https://api.firecrawl.dev/v2/crawl";

export async function fetchFirecrawlCrawlStatus(crawlId: string) {
  const response = await fetch(`${FIRECRAWL_CRAWL_ENDPOINT}/${crawlId}`, {
    method: "GET",
    headers: createFirecrawlRequestHeaders(),
  });
  const body =
    await readFirecrawlJsonResponse<FirecrawlCrawlStatusResponse>(response);

  if (!response.ok || !body) {
    throw new Error(getFirecrawlErrorMessage(body, response.status));
  }

  return body;
}
