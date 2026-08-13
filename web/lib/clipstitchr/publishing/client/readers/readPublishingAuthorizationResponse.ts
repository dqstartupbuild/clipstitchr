import type { PublishingAuthorizationResponse } from "@/lib/clipstitchr/publishing/client/contracts/PublishingAuthorizationResponse";
import { publishingApiSchemas } from "@/lib/clipstitchr/publishing/client/readers/publishingApiSchemas";
import { readPublishingApiResponse } from "@/lib/clipstitchr/publishing/client/readers/readPublishingApiResponse";

export function readPublishingAuthorizationResponse(
  response: Response,
): Promise<PublishingAuthorizationResponse> {
  return readPublishingApiResponse(
    response,
    publishingApiSchemas.authorizationResponse,
  );
}
