import type { SocialPublishingAnalytics } from "@/lib/clipstitchr/types/SocialPublishingAnalytics";

export function getSocialPublishingAnalyticsEngagementTotal(
  analytics: SocialPublishingAnalytics[],
) {
  return analytics.reduce(
    (total, item) =>
      total +
      item.like_count +
      item.comment_count +
      item.share_count +
      item.save_count +
      item.click_count,
    0,
  );
}
