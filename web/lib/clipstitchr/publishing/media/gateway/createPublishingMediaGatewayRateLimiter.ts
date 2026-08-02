import { api } from "@/convex/_generated/api";
import type { PublishingMediaGatewayRateLimiter } from "@/lib/clipstitchr/publishing/media/gateway/PublishingMediaGatewayRateLimiter";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";

export function createPublishingMediaGatewayRateLimiter(): PublishingMediaGatewayRateLimiter {
  return {
    async consume({ grantKey, quotaIdentity, readBytes }) {
      await createConvexHttpClient().mutation(
        api.rateLimits.consumePublishingMediaRead,
        {
          grantKey,
          quotaIdentity,
          readBytes,
          secret: getRateLimitApiSecret(),
        },
      );
    },
  };
}
