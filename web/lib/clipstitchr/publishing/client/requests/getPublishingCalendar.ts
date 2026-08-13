import { readPublishingCalendarResponse } from "@/lib/clipstitchr/publishing/client/readers/readPublishingCalendarResponse";
import { assertPublishingProductIds } from "@/lib/clipstitchr/publishing/client/assertPublishingProductIds";
import { createPublishingResponseMismatchError } from "@/lib/clipstitchr/publishing/client/createPublishingResponseMismatchError";

export async function getPublishingCalendar(
  input: { from: string; timeZone: string; to: string },
  expectedProductId: string,
  signal?: AbortSignal,
) {
  const query = new URLSearchParams(input);
  const response = await fetch(`/api/studio/publishing/calendar?${query}`, {
    cache: "no-store",
    credentials: "same-origin",
    headers: { Accept: "application/json" },
    signal,
  });
  const result = await readPublishingCalendarResponse(response);
  assertPublishingProductIds(expectedProductId, [
    result.productId,
    ...result.posts.map((post) => post.productId),
  ]);
  if (
    result.from !== input.from ||
    result.to !== input.to ||
    result.timeZone !== input.timeZone
  ) {
    throw createPublishingResponseMismatchError(
      "Publishing returned a different calendar range than requested.",
    );
  }
  return result;
}
