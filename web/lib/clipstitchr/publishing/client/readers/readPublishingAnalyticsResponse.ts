import type { PublishingAnalyticsResponse } from "@/lib/clipstitchr/publishing/client/contracts/PublishingAnalyticsResponse";
import { publishingApiSchemas } from "@/lib/clipstitchr/publishing/client/readers/publishingApiSchemas";
import { readPublishingApiResponse } from "@/lib/clipstitchr/publishing/client/readers/readPublishingApiResponse";

export function readPublishingAnalyticsResponse(
  response: Response,
): Promise<PublishingAnalyticsResponse> {
  return readPublishingApiResponse(
    response,
    publishingApiSchemas.analyticsResponse,
  );
}
