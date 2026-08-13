import { createPublishingResponseMismatchError } from "@/lib/clipstitchr/publishing/client/createPublishingResponseMismatchError";
import { readPublishingAnalyticsRefreshResponse } from "@/lib/clipstitchr/publishing/client/readers/readPublishingAnalyticsRefreshResponse";

export async function refreshPublishingAnalytics(postId: string) {
  const response = await fetch("/api/studio/publishing/analytics/refresh", {
    body: JSON.stringify({ postId }),
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const result = await readPublishingAnalyticsRefreshResponse(response);
  if (result.postId !== postId) {
    throw createPublishingResponseMismatchError(
      "Publishing returned analytics for the wrong post.",
    );
  }
  return result;
}
