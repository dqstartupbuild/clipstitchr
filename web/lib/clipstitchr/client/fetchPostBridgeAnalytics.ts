import { readPostBridgeClientErrorMessage } from "@/lib/clipstitchr/client/readPostBridgeClientErrorMessage";
import type { ContentAnalytics } from "@/lib/clipstitchr/types/ContentAnalytics";

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

  return ((await response.json()) as { analytics: ContentAnalytics[] })
    .analytics;
}
