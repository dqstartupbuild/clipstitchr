import { readPublishingCalendarResponse } from "@/lib/clipstitchr/publishing/client/readers/readPublishingCalendarResponse";
import { createPublishingResponseMismatchError } from "@/lib/clipstitchr/publishing/client/createPublishingResponseMismatchError";

export async function getPublishingCalendar(
  input: { from: string; timeZone: string; to: string },
  signal?: AbortSignal,
) {
  const query = new URLSearchParams(input);
  const response = await fetch(`/api/publishing/calendar?${query}`, {
    cache: "no-store",
    credentials: "same-origin",
    headers: { Accept: "application/json" },
    signal,
  });
  const result = await readPublishingCalendarResponse(response);
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
