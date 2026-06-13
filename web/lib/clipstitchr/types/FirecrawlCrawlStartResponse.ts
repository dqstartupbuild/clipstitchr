import type { FirecrawlErrorBody } from "@/lib/clipstitchr/types/FirecrawlErrorBody";

export type FirecrawlCrawlStartResponse = FirecrawlErrorBody & {
  id?: string;
  url?: string;
};
