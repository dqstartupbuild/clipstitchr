import type { PublishingPostsResponse } from "@/lib/clipstitchr/publishing/client/contracts/PublishingPostsResponse";
import { publishingApiSchemas } from "@/lib/clipstitchr/publishing/client/readers/publishingApiSchemas";
import { readPublishingApiResponse } from "@/lib/clipstitchr/publishing/client/readers/readPublishingApiResponse";

export function readPublishingPostsResponse(
  response: Response,
): Promise<PublishingPostsResponse> {
  return readPublishingApiResponse(response, publishingApiSchemas.postsResponse);
}
