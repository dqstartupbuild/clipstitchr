import type { PublishingCalendarResponse } from "@/lib/clipstitchr/publishing/client/contracts/PublishingCalendarResponse";
import { publishingApiSchemas } from "@/lib/clipstitchr/publishing/client/readers/publishingApiSchemas";
import { readPublishingApiResponse } from "@/lib/clipstitchr/publishing/client/readers/readPublishingApiResponse";

export function readPublishingCalendarResponse(
  response: Response,
): Promise<PublishingCalendarResponse> {
  return readPublishingApiResponse(
    response,
    publishingApiSchemas.calendarResponse,
  );
}
