import { createPostBridgeProductUrl } from "@/lib/clipstitchr/client/createPostBridgeProductUrl";
import { readPostBridgeClientErrorMessage } from "@/lib/clipstitchr/client/readPostBridgeClientErrorMessage";
import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";

type FetchPostBridgeAnalyticsOptions = {
  productId?: string;
};

export async function fetchPostBridgeAnalytics({
  productId,
}: FetchPostBridgeAnalyticsOptions = {}) {
  const response = await fetch(
    createPostBridgeProductUrl("/api/post-bridge/analytics", productId),
  );

  if (!response.ok) {
    throw new Error(
      await readPostBridgeClientErrorMessage(
        response,
        "Unable to load post analytics.",
      ),
    );
  }

  return ((await response.json()) as { analytics: PostBridgeAnalytics[] })
    .analytics;
}
