import { createPublishingProxyResponse } from "@/lib/clipstitchr/publishing/service/createPublishingProxyResponse";
import { handlePublishingProxyRequest } from "@/lib/clipstitchr/publishing/service/handlePublishingProxyRequest";
import { PublishingProxyRequestError } from "@/lib/clipstitchr/publishing/service/PublishingProxyRequestError";
import { readPublishingProxyIdentifier } from "@/lib/clipstitchr/publishing/service/readPublishingProxyIdentifier";
import { requestPublishingService } from "@/lib/clipstitchr/publishing/service/requestPublishingService";
import { requirePublishingProxyAuthentication } from "@/lib/clipstitchr/publishing/service/requirePublishingProxyAuthentication";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handlePublishingProxyRequest(async () => {
    await requirePublishingProxyAuthentication();
    if (request.url.length > 4_096) {
      throw new PublishingProxyRequestError(414, "request_uri_too_long");
    }
    const searchParams = new URL(request.url).searchParams;
    if (
      [...searchParams.keys()].some((key) => key !== "integrationId") ||
      searchParams.getAll("integrationId").length !== 1
    ) {
      throw new PublishingProxyRequestError(400, "invalid_query");
    }
    const integrationId = readPublishingProxyIdentifier(
      searchParams.get("integrationId"),
    );
    const response = await requestPublishingService({
      action: "publishing.status.poll",
      method: "GET",
      path: "/v1/integrations/tiktok/creator-info",
      searchParams: { integrationId },
    });
    return createPublishingProxyResponse(response);
  });
}
