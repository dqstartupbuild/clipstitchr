import type { SocialPublishingAnalytics } from "@/lib/clipstitchr/types/SocialPublishingAnalytics";
import { getSocialPublishingAnalyticsCreatedAtMs } from "@/lib/clipstitchr/utils/getSocialPublishingAnalyticsCreatedAtMs";

export function getSocialPublishingAnalyticsCreatedAtLabel(item: SocialPublishingAnalytics) {
  const createdAtMs = getSocialPublishingAnalyticsCreatedAtMs(item);

  if (createdAtMs === null) {
    return "Post date not available";
  }

  return `Posted ${new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(createdAtMs))}`;
}
