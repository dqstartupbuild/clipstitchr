import { assertPublishingProxyEmptyBody } from "@/lib/clipstitchr/publishing/service/assertPublishingProxyEmptyBody";
import { createPublishingProxyResponse } from "@/lib/clipstitchr/publishing/service/createPublishingProxyResponse";
import { handlePublishingProxyRequest } from "@/lib/clipstitchr/publishing/service/handlePublishingProxyRequest";
import { readPublishingProxyIdentifier } from "@/lib/clipstitchr/publishing/service/readPublishingProxyIdentifier";
import { requestPublishingService } from "@/lib/clipstitchr/publishing/service/requestPublishingService";
import { requirePublishingProxyAuthentication } from "@/lib/clipstitchr/publishing/service/requirePublishingProxyAuthentication";

type PublishingIntegrationRouteContext = {
  params: Promise<{ integrationId: string }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  request: Request,
  context: PublishingIntegrationRouteContext,
) {
  return handlePublishingProxyRequest(async () => {
    await requirePublishingProxyAuthentication();
    await assertPublishingProxyEmptyBody(request);
    const { integrationId: integrationIdValue } = await context.params;
    const integrationId = readPublishingProxyIdentifier(integrationIdValue);
    const response = await requestPublishingService({
      action: "publishing.integrations.disconnect",
      method: "DELETE",
      path: `/v1/integrations/${integrationId}`,
    });
    return createPublishingProxyResponse(response);
  });
}
