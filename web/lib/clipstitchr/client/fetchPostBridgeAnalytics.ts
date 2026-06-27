import { readPostBridgeClientErrorMessage } from "@/lib/clipstitchr/client/readPostBridgeClientErrorMessage";
import type { PostBridgeAnalytics } from "@/lib/clipstitchr/types/PostBridgeAnalytics";

export async function fetchPostBridgeAnalytics() {
  const response = await fetch("/api/post-bridge/analytics");

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
