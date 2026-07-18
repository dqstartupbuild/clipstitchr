import { createPostBridgeProductUrl } from "@/lib/clipstitchr/client/createPostBridgeProductUrl";
import { readPostBridgeClientErrorMessage } from "@/lib/clipstitchr/client/readPostBridgeClientErrorMessage";
import type { PostBridgeAnalyticsLoadResult } from "@/lib/clipstitchr/types/PostBridgeAnalyticsLoadResult";

type SyncPostBridgeAnalyticsOptions = {
  productId?: string;
};

export async function syncPostBridgeAnalytics({
  productId,
}: SyncPostBridgeAnalyticsOptions = {}) {
  const response = await fetch(
    createPostBridgeProductUrl("/api/post-bridge/analytics/sync", productId),
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error(
      await readPostBridgeClientErrorMessage(
        response,
        "Unable to sync post analytics.",
      ),
    );
  }

  return (await response.json()) as PostBridgeAnalyticsLoadResult;
}
