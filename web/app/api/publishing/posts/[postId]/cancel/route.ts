import { assertPublishingEmptyQuery } from "@/lib/clipstitchr/publishing/api/assertPublishingEmptyQuery";
import { assertPublishingProxyEmptyBody } from "@/lib/clipstitchr/publishing/service/assertPublishingProxyEmptyBody";
import { createPublishingProxyResponse } from "@/lib/clipstitchr/publishing/service/createPublishingProxyResponse";
import { handlePublishingProxyRequest } from "@/lib/clipstitchr/publishing/service/handlePublishingProxyRequest";
import { readPublishingProxyIdentifier } from "@/lib/clipstitchr/publishing/service/readPublishingProxyIdentifier";
import { requestPublishingService } from "@/lib/clipstitchr/publishing/service/requestPublishingService";
import { requirePublishingProxyAuthentication } from "@/lib/clipstitchr/publishing/service/requirePublishingProxyAuthentication";

type PublishingPostCancelRouteContext = {
  params: Promise<{ postId: string }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: PublishingPostCancelRouteContext,
) {
  return handlePublishingProxyRequest(async () => {
    await requirePublishingProxyAuthentication();
    assertPublishingEmptyQuery(request);
    await assertPublishingProxyEmptyBody(request);
    const { postId: postIdValue } = await context.params;
    const postId = readPublishingProxyIdentifier(postIdValue);
    const response = await requestPublishingService({
      action: "publishing.posts.cancel",
      method: "POST",
      path: `/v1/posts/${postId}/cancel`,
    });
    return createPublishingProxyResponse(response);
  });
}
