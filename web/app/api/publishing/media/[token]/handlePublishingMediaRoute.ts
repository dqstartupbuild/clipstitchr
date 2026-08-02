import { createPublishingMediaGatewayDependencies } from "@/lib/clipstitchr/publishing/media/gateway/createPublishingMediaGatewayDependencies";
import { servePublishingMediaGatewayRequest } from "@/lib/clipstitchr/publishing/media/gateway/servePublishingMediaGatewayRequest";

type PublishingMediaRouteContext = {
  params: Promise<{ token: string }>;
};

export async function handlePublishingMediaRoute(
  request: Request,
  context: PublishingMediaRouteContext,
) {
  const { token } = await context.params;

  return servePublishingMediaGatewayRequest(
    request,
    token,
    createPublishingMediaGatewayDependencies(),
  );
}
