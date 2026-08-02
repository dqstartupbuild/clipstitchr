import { createPublishingProxyResponse } from "@/lib/clipstitchr/publishing/service/createPublishingProxyResponse";
import { handlePublishingProxyRequest } from "@/lib/clipstitchr/publishing/service/handlePublishingProxyRequest";
import { readPublishingProxyJsonBody } from "@/lib/clipstitchr/publishing/service/readPublishingProxyJsonBody";
import { readPublishingProxyProvider } from "@/lib/clipstitchr/publishing/service/readPublishingProxyProvider";
import { requestPublishingService } from "@/lib/clipstitchr/publishing/service/requestPublishingService";
import { requirePublishingProxyAuthentication } from "@/lib/clipstitchr/publishing/service/requirePublishingProxyAuthentication";

type PublishingConnectRouteContext = {
  params: Promise<{ integrationId: string }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: PublishingConnectRouteContext,
) {
  return handlePublishingProxyRequest(async () => {
    await requirePublishingProxyAuthentication();
    const { integrationId: providerValue } = await context.params;
    const provider = readPublishingProxyProvider(providerValue);
    const body = await readPublishingProxyJsonBody(request, 1_024);
    const response = await requestPublishingService({
      action: "publishing.integrations.connect",
      body,
      method: "POST",
      path: `/v1/integrations/${provider}/connect`,
    });
    return createPublishingProxyResponse(response);
  });
}
