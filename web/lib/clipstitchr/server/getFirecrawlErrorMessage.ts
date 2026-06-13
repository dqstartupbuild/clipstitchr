import type { FirecrawlErrorBody } from "@/lib/clipstitchr/types/FirecrawlErrorBody";

export function getFirecrawlErrorMessage(
  body: FirecrawlErrorBody | null,
  status: number,
) {
  return (
    body?.message ||
    body?.error ||
    `Firecrawl could not import this website. Status ${status}.`
  );
}
