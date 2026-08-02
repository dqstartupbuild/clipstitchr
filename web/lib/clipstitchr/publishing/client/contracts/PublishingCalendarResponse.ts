import type { PublishingPostSummary } from "@/lib/clipstitchr/publishing/client/contracts/PublishingPostSummary";

export type PublishingCalendarResponse = {
  from: string;
  posts: PublishingPostSummary[];
  timeZone: string;
  to: string;
};
