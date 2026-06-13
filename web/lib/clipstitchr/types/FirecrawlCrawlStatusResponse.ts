import type { FirecrawlErrorBody } from "@/lib/clipstitchr/types/FirecrawlErrorBody";
import type { FirecrawlScrapeData } from "@/lib/clipstitchr/types/FirecrawlScrapeData";

export type FirecrawlCrawlStatusResponse = FirecrawlErrorBody & {
  completed?: number;
  data?: FirecrawlScrapeData[];
  next?: string | null;
  status?: string;
  total?: number;
};
