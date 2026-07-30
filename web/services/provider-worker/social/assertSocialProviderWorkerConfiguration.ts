import { getSocialPublicBaseUrl } from "@/lib/clipstitchr/server/social/getSocialPublicBaseUrl";
import { readSocialTokenKeyRing } from "@/lib/clipstitchr/server/social/readSocialTokenKeyRing";
import { getSocialAnalyticsApifyActorId } from "./analytics/apify/getSocialAnalyticsApifyActorId";
import { getSocialAnalyticsApifyMaxTotalChargeUsd } from "./analytics/apify/getSocialAnalyticsApifyMaxTotalChargeUsd";
import { getSocialAnalyticsApifyUrlLimit } from "./analytics/apify/getSocialAnalyticsApifyUrlLimit";
import { getInstagramGraphApiVersion } from "@/lib/clipstitchr/social/getInstagramGraphApiVersion";

export function assertSocialProviderWorkerConfiguration() {
  getSocialPublicBaseUrl();
  readSocialTokenKeyRing();
  getInstagramGraphApiVersion();
  getSocialAnalyticsApifyActorId();
  getSocialAnalyticsApifyMaxTotalChargeUsd();
  getSocialAnalyticsApifyUrlLimit();

  if (
    !process.env.TIKTOK_CLIENT_KEY?.trim() ||
    !process.env.TIKTOK_CLIENT_SECRET?.trim()
  ) {
    throw new Error("TikTok provider-worker credentials are missing.");
  }
}
