import { createPostBridgeProductUrl } from "@/lib/clipstitchr/client/createPostBridgeProductUrl";
import { readPostBridgeClientErrorMessage } from "@/lib/clipstitchr/client/readPostBridgeClientErrorMessage";
import type { PostBridgeAnalyticsLoadResult } from "@/lib/clipstitchr/types/PostBridgeAnalyticsLoadResult";

type FetchPostBridgeAnalyticsOptions = {
  productId?: string;
  readOnly?: boolean;
};

export async function fetchPostBridgeAnalytics({
  productId,
  readOnly = false,
}: FetchPostBridgeAnalyticsOptions = {}) {
  const baseUrl = createPostBridgeProductUrl(
    "/api/post-bridge/analytics",
    productId,
  );
  const requestUrl = readOnly
    ? `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}readOnly=1`
    : baseUrl;
  const response = await fetch(requestUrl);

  if (!response.ok) {
    throw new Error(
      await readPostBridgeClientErrorMessage(
        response,
        "Unable to load post analytics.",
      ),
    );
  }

  return (await response.json()) as PostBridgeAnalyticsLoadResult;
}
