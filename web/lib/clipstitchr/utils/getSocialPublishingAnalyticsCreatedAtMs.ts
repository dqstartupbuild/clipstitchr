import type { SocialPublishingAnalytics } from "@/lib/clipstitchr/types/SocialPublishingAnalytics";

export function getSocialPublishingAnalyticsCreatedAtMs(item: SocialPublishingAnalytics) {
  if (typeof item.platform_created_at !== "string") {
    return null;
  }

  const timestamp = Date.parse(item.platform_created_at);

  return Number.isFinite(timestamp) ? timestamp : null;
}
