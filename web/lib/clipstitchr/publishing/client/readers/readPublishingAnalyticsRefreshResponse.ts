import type { PublishingAnalyticsRefreshResponse } from "@/lib/clipstitchr/publishing/client/contracts/PublishingAnalyticsRefreshResponse";
import { publishingApiSchemas } from "@/lib/clipstitchr/publishing/client/readers/publishingApiSchemas";
import { readPublishingApiResponse } from "@/lib/clipstitchr/publishing/client/readers/readPublishingApiResponse";

export function readPublishingAnalyticsRefreshResponse(
  response: Response,
): Promise<PublishingAnalyticsRefreshResponse> {
  return readPublishingApiResponse(
    response,
    publishingApiSchemas.analyticsRefreshResponse,
  );
}
