import { readPublishingCalendarQuery } from "@/lib/clipstitchr/publishing/api/readPublishingCalendarQuery";
import { createPublishingProxyResponse } from "@/lib/clipstitchr/publishing/service/createPublishingProxyResponse";
import { handlePublishingProxyRequest } from "@/lib/clipstitchr/publishing/service/handlePublishingProxyRequest";
import { requestPublishingService } from "@/lib/clipstitchr/publishing/service/requestPublishingService";
import { requirePublishingProxyAuthentication } from "@/lib/clipstitchr/publishing/service/requirePublishingProxyAuthentication";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handlePublishingProxyRequest(async () => {
    const scope = await requirePublishingProxyAuthentication();
    const searchParams = readPublishingCalendarQuery(request);
    const response = await requestPublishingService({
      action: "publishing.posts.read",
      method: "GET",
      path: "/v1/calendar",
      searchParams: { ...searchParams, productId: scope.productId },
    });
    return createPublishingProxyResponse(response);
  });
}
