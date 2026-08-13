import type { PublishingPostResponse } from "@/lib/clipstitchr/publishing/client/contracts/PublishingPostResponse";
import { publishingApiSchemas } from "@/lib/clipstitchr/publishing/client/readers/publishingApiSchemas";
import { readPublishingApiResponse } from "@/lib/clipstitchr/publishing/client/readers/readPublishingApiResponse";

export function readPublishingPostResponse(
  response: Response,
): Promise<PublishingPostResponse> {
  return readPublishingApiResponse(response, publishingApiSchemas.postResponse);
}
