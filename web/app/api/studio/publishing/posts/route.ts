import { assertPublishingMediaCompatibility } from "@/lib/clipstitchr/publishing/api/assertPublishingMediaCompatibility";
import { assertPublishingEmptyQuery } from "@/lib/clipstitchr/publishing/api/assertPublishingEmptyQuery";
import { getPublishingCreatePostAction } from "@/lib/clipstitchr/publishing/api/getPublishingCreatePostAction";
import { readPublishingCreatePostRequest } from "@/lib/clipstitchr/publishing/api/readPublishingCreatePostRequest";
import { readPublishingPostsQuery } from "@/lib/clipstitchr/publishing/api/readPublishingPostsQuery";
import { resolvePublishingApiMedia } from "@/lib/clipstitchr/publishing/api/resolvePublishingApiMedia";
import { resolvePublishingApiDestinations } from "@/lib/clipstitchr/publishing/api/resolvePublishingApiDestinations";
import { createPublishingProxyResponse } from "@/lib/clipstitchr/publishing/service/createPublishingProxyResponse";
import { handlePublishingProxyRequest } from "@/lib/clipstitchr/publishing/service/handlePublishingProxyRequest";
import { PublishingProxyRequestError } from "@/lib/clipstitchr/publishing/service/PublishingProxyRequestError";
import { requestPublishingService } from "@/lib/clipstitchr/publishing/service/requestPublishingService";
import { requirePublishingProxyAuthentication } from "@/lib/clipstitchr/publishing/service/requirePublishingProxyAuthentication";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handlePublishingProxyRequest(async () => {
    const scope = await requirePublishingProxyAuthentication();
    const status = readPublishingPostsQuery(request);
    const response = await requestPublishingService({
      action: "publishing.posts.read",
      method: "GET",
      path: "/v1/posts",
      searchParams: {
        productId: scope.productId,
        ...(status === undefined ? {} : { status }),
      },
    });
    return createPublishingProxyResponse(response);
  });
}

export async function POST(request: Request) {
  return handlePublishingProxyRequest(async () => {
    const scope = await requirePublishingProxyAuthentication();
    assertPublishingEmptyQuery(request);
    const input = await readPublishingCreatePostRequest(request);
    const resolution = await resolvePublishingApiMedia({
      convex: scope.convex,
      descriptor: input.media,
      productId: scope.productId,
    });

    if (input.mediaRevision !== resolution.manifest.sourceRevision) {
      throw new PublishingProxyRequestError(409, "stale_media_revision");
    }
    assertPublishingMediaCompatibility(
      input.destinations,
      resolution.mediaObjects,
    );
    const destinations = await resolvePublishingApiDestinations({
      convex: scope.convex,
      destinations: input.destinations,
      productId: scope.productId,
    });

    const response = await requestPublishingService({
      action: getPublishingCreatePostAction(input.intent),
      body: {
        ...input,
        destinations,
        productId: scope.productId,
        resolvedMedia: resolution.manifest,
      },
      method: "POST",
      path: "/v1/posts",
    });
    return createPublishingProxyResponse(response);
  });
}
