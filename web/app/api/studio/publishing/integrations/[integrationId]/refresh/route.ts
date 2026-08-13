import { assertPublishingProxyEmptyBody } from "@/lib/clipstitchr/publishing/service/assertPublishingProxyEmptyBody";
import { createPublishingProxyResponse } from "@/lib/clipstitchr/publishing/service/createPublishingProxyResponse";
import { handlePublishingProxyRequest } from "@/lib/clipstitchr/publishing/service/handlePublishingProxyRequest";
import { readPublishingProxyIdentifier } from "@/lib/clipstitchr/publishing/service/readPublishingProxyIdentifier";
import { requestPublishingService } from "@/lib/clipstitchr/publishing/service/requestPublishingService";
import { requirePublishingProxyAuthentication } from "@/lib/clipstitchr/publishing/service/requirePublishingProxyAuthentication";

type PublishingRefreshRouteContext = {
  params: Promise<{ integrationId: string }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: PublishingRefreshRouteContext,
) {
  return handlePublishingProxyRequest(async () => {
    await requirePublishingProxyAuthentication();
    await assertPublishingProxyEmptyBody(request);
    const { integrationId: integrationIdValue } = await context.params;
    const integrationId = readPublishingProxyIdentifier(integrationIdValue);
    const response = await requestPublishingService({
      action: "publishing.integrations.refresh",
      method: "POST",
      path: `/v1/integrations/${integrationId}/refresh`,
    });
    return createPublishingProxyResponse(response);
  });
}
