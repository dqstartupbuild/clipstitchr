import { inspectPublishingMediaCompatibility } from "@/lib/clipstitchr/publishing/media/inspectPublishingMediaCompatibility";
import { assertPublishingEmptyQuery } from "@/lib/clipstitchr/publishing/api/assertPublishingEmptyQuery";
import { readPublishingCompatibilityRequest } from "@/lib/clipstitchr/publishing/api/readPublishingCompatibilityRequest";
import { resolvePublishingApiMedia } from "@/lib/clipstitchr/publishing/api/resolvePublishingApiMedia";
import { createPublishingProxyResponse } from "@/lib/clipstitchr/publishing/service/createPublishingProxyResponse";
import { handlePublishingProxyRequest } from "@/lib/clipstitchr/publishing/service/handlePublishingProxyRequest";
import { requestPublishingService } from "@/lib/clipstitchr/publishing/service/requestPublishingService";
import { requirePublishingProxyAuthentication } from "@/lib/clipstitchr/publishing/service/requirePublishingProxyAuthentication";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handlePublishingProxyRequest(async () => {
    await requirePublishingProxyAuthentication();
    assertPublishingEmptyQuery(request);
    const input = await readPublishingCompatibilityRequest(request);
    const resolution = await resolvePublishingApiMedia(input.media);

    for (const destination of input.destinations) {
      inspectPublishingMediaCompatibility(
        destination.provider,
        resolution.mediaObjects,
      );
    }

    const response = await requestPublishingService({
      action: "publishing.media.read",
      body: {
        destinations: input.destinations,
        media: resolution.manifest,
        mediaRevision: resolution.manifest.sourceRevision,
      },
      method: "POST",
      path: "/v1/media/compatibility",
    });
    return createPublishingProxyResponse(response);
  });
}
