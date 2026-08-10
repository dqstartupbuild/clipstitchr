import { isSocialPublishingPlatform } from "@/lib/clipstitchr/server/socialPublishing/isSocialPublishingPlatform";
import type { SocialPublishingAnalytics } from "@/lib/clipstitchr/types/SocialPublishingAnalytics";

export function filterSupportedSocialPublishingAnalytics(
  analytics: (SocialPublishingAnalytics & { platform: unknown })[],
) {
  return analytics.filter(
    (item): item is SocialPublishingAnalytics => isSocialPublishingPlatform(item.platform),
  );
}
