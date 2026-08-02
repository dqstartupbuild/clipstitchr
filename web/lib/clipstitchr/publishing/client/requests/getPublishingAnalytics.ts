import { readPublishingAnalyticsResponse } from "@/lib/clipstitchr/publishing/client/readers/readPublishingAnalyticsResponse";
import { createPublishingResponseMismatchError } from "@/lib/clipstitchr/publishing/client/createPublishingResponseMismatchError";

export async function getPublishingAnalytics(
  range: "30d" | "7d" | "90d",
  signal?: AbortSignal,
) {
  const response = await fetch(
    `/api/publishing/analytics?${new URLSearchParams({ range })}`,
    {
      cache: "no-store",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
      signal,
    },
  );
  const result = await readPublishingAnalyticsResponse(response);
  if (result.range !== range) {
    throw createPublishingResponseMismatchError(
      "Publishing returned analytics for the wrong time range.",
    );
  }
  return result;
}
