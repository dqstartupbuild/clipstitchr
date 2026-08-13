import { createPublishingProxyResponse } from "@/lib/clipstitchr/publishing/service/createPublishingProxyResponse";
import { handlePublishingProxyRequest } from "@/lib/clipstitchr/publishing/service/handlePublishingProxyRequest";
import { requestPublishingService } from "@/lib/clipstitchr/publishing/service/requestPublishingService";
import { requirePublishingProxyAuthentication } from "@/lib/clipstitchr/publishing/service/requirePublishingProxyAuthentication";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return handlePublishingProxyRequest(async () => {
    await requirePublishingProxyAuthentication();
    const response = await requestPublishingService({
      action: "publishing.integrations.read",
      method: "GET",
      path: "/v1/integrations",
    });
    return createPublishingProxyResponse(response);
  });
}
