import type { TikTokCreatorInfo } from "@/lib/clipstitchr/publishing/client/contracts/TikTokCreatorInfo";
import { publishingApiSchemas } from "@/lib/clipstitchr/publishing/client/readers/publishingApiSchemas";
import { readPublishingApiResponse } from "@/lib/clipstitchr/publishing/client/readers/readPublishingApiResponse";

export async function readTikTokCreatorInfoResponse(
  response: Response,
): Promise<TikTokCreatorInfo> {
  const body = await readPublishingApiResponse(
    response,
    publishingApiSchemas.tikTokCreatorInfoResponse,
  );
  return body.creatorInfo;
}
