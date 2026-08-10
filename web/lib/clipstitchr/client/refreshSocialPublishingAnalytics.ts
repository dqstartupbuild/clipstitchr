import { createSocialPublishingProductUrl } from "@/lib/clipstitchr/client/createSocialPublishingProductUrl";
import { readSocialPublishingClientErrorMessage } from "@/lib/clipstitchr/client/readSocialPublishingClientErrorMessage";
import type { SocialPublishingAnalyticsLoadResult } from "@/lib/clipstitchr/types/SocialPublishingAnalyticsLoadResult";

type RefreshSocialPublishingAnalyticsOptions = {
  productId?: string;
};

export async function refreshSocialPublishingAnalytics({
  productId,
}: RefreshSocialPublishingAnalyticsOptions = {}) {
  const response = await fetch(
    createSocialPublishingProductUrl("/api/social-publishing/analytics/sync", productId),
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error(
      await readSocialPublishingClientErrorMessage(
        response,
        "Unable to refresh post analytics.",
      ),
    );
  }

  return (await response.json()) as SocialPublishingAnalyticsLoadResult;
}
