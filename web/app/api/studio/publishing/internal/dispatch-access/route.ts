import { api } from "@/convex/_generated/api";
import { assertStudioPublishingDispatchAccessSecret } from "@/lib/clipstitchr/publishing/service/assertStudioPublishingDispatchAccessSecret";
import { createStudioPublishingDispatchAccessResponse } from "@/lib/clipstitchr/publishing/service/createStudioPublishingDispatchAccessResponse";
import { readStudioPublishingDispatchAccessRequest } from "@/lib/clipstitchr/publishing/service/readStudioPublishingDispatchAccessRequest";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { getStudioBetaGlobalEnabled } from "@/lib/clipstitchr/studio/access/getStudioBetaGlobalEnabled";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertStudioPublishingDispatchAccessSecret(request);
  } catch {
    return createStudioPublishingDispatchAccessResponse(false, 401);
  }

  let scope;

  try {
    scope = await readStudioPublishingDispatchAccessRequest(request);
  } catch {
    return createStudioPublishingDispatchAccessResponse(false, 400);
  }

  if (!getStudioBetaGlobalEnabled()) {
    return createStudioPublishingDispatchAccessResponse(false);
  }

  try {
    const decision = await createConvexHttpClient().mutation(
      api.studioPublishingScope.authorizePublishingDispatch
        .authorizePublishingDispatch,
      {
        ...scope,
        secret: getRateLimitApiSecret(),
      },
    );
    return createStudioPublishingDispatchAccessResponse(decision.allowed);
  } catch {
    return createStudioPublishingDispatchAccessResponse(false, 503);
  }
}
