import { assertPublishingMediaCompatibility } from "@/lib/clipstitchr/publishing/api/assertPublishingMediaCompatibility";
import { assertPublishingEmptyQuery } from "@/lib/clipstitchr/publishing/api/assertPublishingEmptyQuery";
import { getPublishingCreatePostAction } from "@/lib/clipstitchr/publishing/api/getPublishingCreatePostAction";
import { readPublishingCreatePostRequest } from "@/lib/clipstitchr/publishing/api/readPublishingCreatePostRequest";
import { readPublishingPostsQuery } from "@/lib/clipstitchr/publishing/api/readPublishingPostsQuery";
import { resolvePublishingApiMedia } from "@/lib/clipstitchr/publishing/api/resolvePublishingApiMedia";
import { createPublishingProxyResponse } from "@/lib/clipstitchr/publishing/service/createPublishingProxyResponse";
import { handlePublishingProxyRequest } from "@/lib/clipstitchr/publishing/service/handlePublishingProxyRequest";
import { PublishingProxyRequestError } from "@/lib/clipstitchr/publishing/service/PublishingProxyRequestError";
import { requestPublishingService } from "@/lib/clipstitchr/publishing/service/requestPublishingService";
import { requirePublishingProxyAuthentication } from "@/lib/clipstitchr/publishing/service/requirePublishingProxyAuthentication";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handlePublishingProxyRequest(async () => {
    await requirePublishingProxyAuthentication();
    const status = readPublishingPostsQuery(request);
    const response = await requestPublishingService({
      action: "publishing.posts.read",
      method: "GET",
      path: "/v1/posts",
      ...(status === undefined ? {} : { searchParams: { status } }),
    });
    return createPublishingProxyResponse(response);
  });
}

export async function POST(request: Request) {
  return handlePublishingProxyRequest(async () => {
    await requirePublishingProxyAuthentication();
    assertPublishingEmptyQuery(request);
    const input = await readPublishingCreatePostRequest(request);
    const resolution = await resolvePublishingApiMedia(input.media);

    if (input.mediaRevision !== resolution.manifest.sourceRevision) {
      throw new PublishingProxyRequestError(409, "stale_media_revision");
    }
    assertPublishingMediaCompatibility(
      input.destinations,
      resolution.mediaObjects,
    );

    const response = await requestPublishingService({
      action: getPublishingCreatePostAction(input.intent),
      body: { ...input, resolvedMedia: resolution.manifest },
      method: "POST",
      path: "/v1/posts",
    });
    return createPublishingProxyResponse(response);
  });
}
