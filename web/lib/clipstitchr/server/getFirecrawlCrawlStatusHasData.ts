import type { FirecrawlCrawlStatusResponse } from "@/lib/clipstitchr/types/FirecrawlCrawlStatusResponse";

export function getFirecrawlCrawlStatusHasData(
  status: FirecrawlCrawlStatusResponse,
) {
  return Array.isArray(status.data) && status.data.length > 0;
}
