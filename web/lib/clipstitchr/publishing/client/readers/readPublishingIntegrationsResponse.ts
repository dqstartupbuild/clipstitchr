import type { PublishingIntegrationsResponse } from "@/lib/clipstitchr/publishing/client/contracts/PublishingIntegrationsResponse";
import { publishingApiSchemas } from "@/lib/clipstitchr/publishing/client/readers/publishingApiSchemas";
import { readPublishingApiResponse } from "@/lib/clipstitchr/publishing/client/readers/readPublishingApiResponse";

export function readPublishingIntegrationsResponse(
  response: Response,
): Promise<PublishingIntegrationsResponse> {
  return readPublishingApiResponse(
    response,
    publishingApiSchemas.integrationsResponse,
  );
}
