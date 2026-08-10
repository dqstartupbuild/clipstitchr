import { api } from "@/convex/_generated/api";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { createSocialPublishingProviderRateLimitKey } from "@/lib/clipstitchr/server/socialPublishing/createSocialPublishingProviderRateLimitKey";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { waitForMilliseconds } from "@/lib/clipstitchr/utils/waitForMilliseconds";

export async function reserveSocialPublishingProviderRequest(apiKey: string) {
  const convex = createConvexHttpClient();
  const key = createSocialPublishingProviderRateLimitKey(apiKey);

  while (true) {
    const status = await convex.mutation(
      api.socialPublishingRateLimits.reserveSocialPublishingProviderRequest
        .reserveSocialPublishingProviderRequest,
      {
        key,
        secret: getRateLimitApiSecret(),
      },
    );

    if (status.ok) {
      if (status.retryAfter) {
        await waitForMilliseconds(status.retryAfter);
      }

      return;
    }

    await waitForMilliseconds(Math.max(1, status.retryAfter ?? 125));
  }
}
