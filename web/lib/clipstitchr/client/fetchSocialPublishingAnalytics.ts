import { createSocialPublishingProductUrl } from "@/lib/clipstitchr/client/createSocialPublishingProductUrl";
import { readSocialPublishingClientErrorMessage } from "@/lib/clipstitchr/client/readSocialPublishingClientErrorMessage";
import type { SocialPublishingAnalyticsLoadResult } from "@/lib/clipstitchr/types/SocialPublishingAnalyticsLoadResult";

type FetchSocialPublishingAnalyticsOptions = {
  productId?: string;
};

export async function fetchSocialPublishingAnalytics({
  productId,
}: FetchSocialPublishingAnalyticsOptions = {}) {
  const response = await fetch(
    createSocialPublishingProductUrl("/api/social-publishing/analytics", productId),
  );

  if (!response.ok) {
    throw new Error(
      await readSocialPublishingClientErrorMessage(
        response,
        "Unable to load post analytics.",
      ),
    );
  }

  return (await response.json()) as SocialPublishingAnalyticsLoadResult;
}
