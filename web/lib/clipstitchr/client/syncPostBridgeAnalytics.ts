import { readPostBridgeClientErrorMessage } from "@/lib/clipstitchr/client/readPostBridgeClientErrorMessage";
import type { ContentAnalytics } from "@/lib/clipstitchr/types/ContentAnalytics";

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

  return ((await response.json()) as { analytics: ContentAnalytics[] })
    .analytics;
}
