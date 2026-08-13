import { assertPublishingEmptyQuery } from "@/lib/clipstitchr/publishing/api/assertPublishingEmptyQuery";
import { readPublishingAnalyticsRefreshRequest } from "@/lib/clipstitchr/publishing/api/readPublishingAnalyticsRefreshRequest";
import { createPublishingProxyResponse } from "@/lib/clipstitchr/publishing/service/createPublishingProxyResponse";
import { handlePublishingProxyRequest } from "@/lib/clipstitchr/publishing/service/handlePublishingProxyRequest";
import { requestPublishingService } from "@/lib/clipstitchr/publishing/service/requestPublishingService";
import { requirePublishingProxyAuthentication } from "@/lib/clipstitchr/publishing/service/requirePublishingProxyAuthentication";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handlePublishingProxyRequest(async () => {
    const scope = await requirePublishingProxyAuthentication();
    assertPublishingEmptyQuery(request);
    const input = await readPublishingAnalyticsRefreshRequest(request);
    const response = await requestPublishingService({
      action: "publishing.analytics.refresh",
      body: { postId: input.postId, productId: scope.productId },
      method: "POST",
      path: "/v1/analytics/refresh",
    });
    return createPublishingProxyResponse(response);
  });
}
