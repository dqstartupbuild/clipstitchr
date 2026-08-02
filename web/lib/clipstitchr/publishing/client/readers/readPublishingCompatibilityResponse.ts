import type { PublishingCompatibilityResponse } from "@/lib/clipstitchr/publishing/client/contracts/PublishingCompatibilityResponse";
import { publishingApiSchemas } from "@/lib/clipstitchr/publishing/client/readers/publishingApiSchemas";
import { readPublishingApiResponse } from "@/lib/clipstitchr/publishing/client/readers/readPublishingApiResponse";

export function readPublishingCompatibilityResponse(
  response: Response,
): Promise<PublishingCompatibilityResponse> {
  return readPublishingApiResponse(
    response,
    publishingApiSchemas.compatibilityResponse,
  );
}
