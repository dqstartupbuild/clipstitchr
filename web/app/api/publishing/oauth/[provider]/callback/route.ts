import { createPublishingOAuthRedirectResponse } from "@/lib/clipstitchr/publishing/service/createPublishingOAuthRedirectResponse";
import { readPublishingCallbackOutcome } from "@/lib/clipstitchr/publishing/service/readPublishingCallbackOutcome";
import { readPublishingOAuthCallbackQuery } from "@/lib/clipstitchr/publishing/service/readPublishingOAuthCallbackQuery";
import { readPublishingProxyProvider } from "@/lib/clipstitchr/publishing/service/readPublishingProxyProvider";
import { requestPublishingService } from "@/lib/clipstitchr/publishing/service/requestPublishingService";
import { requirePublishingProxyAuthentication } from "@/lib/clipstitchr/publishing/service/requirePublishingProxyAuthentication";

type PublishingOAuthCallbackRouteContext = {
  params: Promise<{ provider: string }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: PublishingOAuthCallbackRouteContext,
) {
  try {
    await requirePublishingProxyAuthentication();
    const { provider: providerValue } = await context.params;
    const provider = readPublishingProxyProvider(providerValue);
    const callback = readPublishingOAuthCallbackQuery(request);
    const response = await requestPublishingService({
      action: "publishing.integrations.callback",
      body: callback,
      method: "POST",
      path: `/v1/integrations/${provider}/callback`,
    });
    return createPublishingOAuthRedirectResponse(
      readPublishingCallbackOutcome(response.body),
    );
  } catch {
    return createPublishingOAuthRedirectResponse("failed");
  }
}
