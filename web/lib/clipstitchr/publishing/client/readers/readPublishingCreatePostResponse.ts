import type { PublishingCreatePostResponse } from "@/lib/clipstitchr/publishing/client/contracts/PublishingCreatePostResponse";
import { publishingApiSchemas } from "@/lib/clipstitchr/publishing/client/readers/publishingApiSchemas";
import { readPublishingApiResponse } from "@/lib/clipstitchr/publishing/client/readers/readPublishingApiResponse";

export function readPublishingCreatePostResponse(
  response: Response,
): Promise<PublishingCreatePostResponse> {
  return readPublishingApiResponse(
    response,
    publishingApiSchemas.createPostResponse,
  );
}
