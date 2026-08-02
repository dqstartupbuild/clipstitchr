import { assertPublishingEmptyQuery } from "@/lib/clipstitchr/publishing/api/assertPublishingEmptyQuery";
import { createPublishingProxyResponse } from "@/lib/clipstitchr/publishing/service/createPublishingProxyResponse";
import { handlePublishingProxyRequest } from "@/lib/clipstitchr/publishing/service/handlePublishingProxyRequest";
import { readPublishingProxyIdentifier } from "@/lib/clipstitchr/publishing/service/readPublishingProxyIdentifier";
import { requestPublishingService } from "@/lib/clipstitchr/publishing/service/requestPublishingService";
import { requirePublishingProxyAuthentication } from "@/lib/clipstitchr/publishing/service/requirePublishingProxyAuthentication";

type PublishingPostRouteContext = {
  params: Promise<{ postId: string }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: PublishingPostRouteContext,
) {
  return handlePublishingProxyRequest(async () => {
    await requirePublishingProxyAuthentication();
    assertPublishingEmptyQuery(request);
    const { postId: postIdValue } = await context.params;
    const postId = readPublishingProxyIdentifier(postIdValue);
    const response = await requestPublishingService({
      action: "publishing.posts.read",
      method: "GET",
      path: `/v1/posts/${postId}`,
    });
    return createPublishingProxyResponse(response);
  });
}
