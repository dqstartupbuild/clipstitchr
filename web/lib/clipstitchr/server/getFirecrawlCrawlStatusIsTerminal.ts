import type { FirecrawlCrawlStatusResponse } from "@/lib/clipstitchr/types/FirecrawlCrawlStatusResponse";

export function getFirecrawlCrawlStatusIsTerminal(
  status: FirecrawlCrawlStatusResponse,
) {
  return (
    status.status === "completed" ||
    status.status === "failed" ||
    status.status === "cancelled"
  );
}
