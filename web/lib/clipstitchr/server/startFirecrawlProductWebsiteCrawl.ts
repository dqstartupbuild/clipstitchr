import { createFirecrawlProductWebsiteCrawlBody } from "@/lib/clipstitchr/server/createFirecrawlProductWebsiteCrawlBody";
import { createFirecrawlRequestHeaders } from "@/lib/clipstitchr/server/createFirecrawlRequestHeaders";
import { getFirecrawlErrorMessage } from "@/lib/clipstitchr/server/getFirecrawlErrorMessage";
import { readFirecrawlJsonResponse } from "@/lib/clipstitchr/server/readFirecrawlJsonResponse";
import type { FirecrawlCrawlStartResponse } from "@/lib/clipstitchr/types/FirecrawlCrawlStartResponse";

const FIRECRAWL_CRAWL_ENDPOINT = "https://api.firecrawl.dev/v2/crawl";

export async function startFirecrawlProductWebsiteCrawl(url: string) {
  const response = await fetch(FIRECRAWL_CRAWL_ENDPOINT, {
    method: "POST",
    headers: createFirecrawlRequestHeaders(),
    body: JSON.stringify(createFirecrawlProductWebsiteCrawlBody(url)),
  });
  const body =
    await readFirecrawlJsonResponse<FirecrawlCrawlStartResponse>(response);

  if (!response.ok || body?.success !== true || !body.id) {
    throw new Error(getFirecrawlErrorMessage(body, response.status));
  }

  return body.id;
}
