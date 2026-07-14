import { api } from "@/convex/_generated/api";
import { getLoopsReadiness } from "@/lib/clipstitchr/email/loops/getLoopsReadiness";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { hashBrowserRecognitionToken } from "@/lib/clipstitchr/tools/browserRecognition/hashBrowserRecognitionToken";
import { readBrowserRecognitionToken } from "@/lib/clipstitchr/tools/browserRecognition/readBrowserRecognitionToken";
import { getPublicToolGateMetadata } from "@/lib/clipstitchr/tools/catalog/getPublicToolGateMetadata";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";
import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";
import { createPublicToolInteractionAcceptedResponse } from "@/lib/clipstitchr/tools/publicToolGates/server/createPublicToolInteractionAcceptedResponse";
import { createPublicToolInteractionRateLimitResponse } from "@/lib/clipstitchr/tools/publicToolGates/server/createPublicToolInteractionRateLimitResponse";
import { readPublicToolInteractionRequest } from "@/lib/clipstitchr/tools/publicToolGates/server/readPublicToolInteractionRequest";
import { ToolLeadRequestError } from "@/lib/clipstitchr/tools/toolLeads/server/ToolLeadRequestError";
import { createToolLeadClientKey } from "@/lib/clipstitchr/tools/toolLeads/server/createToolLeadClientKey";
import { getToolLeadRequestIsSameOrigin } from "@/lib/clipstitchr/tools/toolLeads/server/getToolLeadRequestIsSameOrigin";

export async function handlePublicToolInteractionRequest(
  request: Request,
  source: PublicToolKey,
) {
  if (!getToolLeadRequestIsSameOrigin(request)) {
    return Response.json(
      { message: "Unable to accept this request." },
      { headers: { "Cache-Control": "private, no-store" }, status: 403 },
    );
  }

  try {
    const interactionType = await readPublicToolInteractionRequest(request);
    const recognitionToken = readBrowserRecognitionToken(request);

    if (!recognitionToken) {
      return createPublicToolInteractionAcceptedResponse();
    }

    const secret = getRateLimitApiSecret();
    const readiness = getLoopsReadiness(process.env);
    const gateVariant = await resolvePublicToolGateVariantForRequest(
      source,
      readiness.emailNativeReady,
    );

    await createConvexHttpClient().mutation(
      api.toolLeads.recordInteraction.recordInteraction,
      {
        clientKey: createToolLeadClientKey(request, secret),
        gateMode: getPublicToolGateMetadata(source).mode,
        gateVariant,
        interactionType,
        occurredAt: Date.now(),
        recognitionTokenHash:
          await hashBrowserRecognitionToken(recognitionToken),
        secret,
        source,
      },
    );

    return createPublicToolInteractionAcceptedResponse();
  } catch (error) {
    const rateLimitResponse =
      createPublicToolInteractionRateLimitResponse(error);

    if (rateLimitResponse) return rateLimitResponse;

    if (error instanceof ToolLeadRequestError) {
      return Response.json(
        { message: "Unable to accept this request." },
        {
          headers: { "Cache-Control": "private, no-store" },
          status: error.status,
        },
      );
    }

    return Response.json(
      { message: "Unable to save this update right now." },
      { headers: { "Cache-Control": "private, no-store" }, status: 500 },
    );
  }
}
