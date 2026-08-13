import { readPublishingAnalyticsResponse } from "@/lib/clipstitchr/publishing/client/readers/readPublishingAnalyticsResponse";
import { assertPublishingProductIds } from "@/lib/clipstitchr/publishing/client/assertPublishingProductIds";
import { createPublishingResponseMismatchError } from "@/lib/clipstitchr/publishing/client/createPublishingResponseMismatchError";

export async function getPublishingAnalytics(
  range: "30d" | "7d" | "90d",
  expectedProductId: string,
  signal?: AbortSignal,
) {
  const response = await fetch(
    `/api/studio/publishing/analytics?${new URLSearchParams({ range })}`,
    {
      cache: "no-store",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
      signal,
    },
  );
  const result = await readPublishingAnalyticsResponse(response);
  assertPublishingProductIds(expectedProductId, [
    result.productId,
    ...result.publications.map((publication) => publication.productId),
  ]);
  if (result.range !== range) {
    throw createPublishingResponseMismatchError(
      "Publishing returned analytics for the wrong time range.",
    );
  }
  return result;
}
