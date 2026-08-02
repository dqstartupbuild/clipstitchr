import { api } from "@/convex/_generated/api";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { createPostBridgeProviderRateLimitKey } from "@/lib/clipstitchr/server/postBridge/createPostBridgeProviderRateLimitKey";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { waitForMilliseconds } from "@/lib/clipstitchr/utils/waitForMilliseconds";

export async function reservePostBridgeProviderRequest(apiKey: string) {
  const convex = createConvexHttpClient();
  const key = createPostBridgeProviderRateLimitKey(apiKey);

  while (true) {
    const status = await convex.mutation(
      api.postBridgeRateLimits.reservePostBridgeProviderRequest
        .reservePostBridgeProviderRequest,
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
