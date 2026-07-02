import { readPostBridgeClientErrorMessage } from "@/lib/clipstitchr/client/readPostBridgeClientErrorMessage";
import type { PostBridgeAnalyticsSyncResponse } from "@/lib/clipstitchr/types/PostBridgeAnalyticsSyncResponse";

export async function syncPostBridgeAnalytics() {
  const response = await fetch("/api/post-bridge/analytics/sync", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      await readPostBridgeClientErrorMessage(
        response,
        "Unable to sync post analytics.",
      ),
    );
  }

  return (await response.json()) as PostBridgeAnalyticsSyncResponse;
}
