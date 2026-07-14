import { api } from "@/convex/_generated/api";
import { getLoopsReadiness } from "@/lib/clipstitchr/email/loops/getLoopsReadiness";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { hashBrowserRecognitionToken } from "@/lib/clipstitchr/tools/browserRecognition/hashBrowserRecognitionToken";
import { readBrowserRecognitionToken } from "@/lib/clipstitchr/tools/browserRecognition/readBrowserRecognitionToken";
import { getPublicToolGateMetadata } from "@/lib/clipstitchr/tools/catalog/getPublicToolGateMetadata";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";
import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";
import { createToolLeadClientKey } from "@/lib/clipstitchr/tools/toolLeads/server/createToolLeadClientKey";
import { createEmailNativeEnrollmentRateLimitResponse } from "@/lib/clipstitchr/tools/toolLeads/server/createEmailNativeEnrollmentRateLimitResponse";
import { createEmailNativeEnrollmentAcceptedResponse } from "@/lib/clipstitchr/tools/toolLeads/server/createEmailNativeEnrollmentAcceptedResponse";
import { getToolLeadRequestIsSameOrigin } from "@/lib/clipstitchr/tools/toolLeads/server/getToolLeadRequestIsSameOrigin";

export async function handleEmailNativeEnrollmentRequest({
  request,
  source,
}: {
  request: Request;
  source: PublicToolKey;
}) {
  if (!getToolLeadRequestIsSameOrigin(request)) {
    return Response.json(
      { message: "Unable to accept this request." },
      {
        headers: { "Cache-Control": "private, no-store" },
        status: 403,
      },
    );
  }

  const metadata = getPublicToolGateMetadata(source);

  if (metadata.mode !== "email-native") {
    return Response.json(
      { message: "Tool not found." },
      {
        headers: { "Cache-Control": "private, no-store" },
        status: 404,
      },
    );
  }

  try {
    const readiness = getLoopsReadiness(process.env);

    if (!readiness.emailNativeReady) {
      return createEmailNativeEnrollmentAcceptedResponse();
    }

    const variant = await resolvePublicToolGateVariantForRequest(
      source,
      readiness.emailNativeReady,
    );
    const recognitionToken = readBrowserRecognitionToken(request);

    if (variant !== "hybrid-v1" || !recognitionToken) {
      return createEmailNativeEnrollmentAcceptedResponse();
    }

    const secret = getRateLimitApiSecret();
    const clientKey = createToolLeadClientKey(request, secret);

    await createConvexHttpClient().mutation(
      api.toolLeads.enrollEmailNative.enrollEmailNative,
      {
        clientKey,
        enrolledAt: Date.now(),
        gateVariant: variant,
        recognitionTokenHash:
          await hashBrowserRecognitionToken(recognitionToken),
        secret,
        source,
        workflowKey: metadata.workflowKey,
        workflowVersion: "v1",
      },
    );

    return createEmailNativeEnrollmentAcceptedResponse();
  } catch (error) {
    const rateLimitResponse =
      createEmailNativeEnrollmentRateLimitResponse(error);

    if (rateLimitResponse) return rateLimitResponse;

    return Response.json(
      { message: "Unable to request enrollment right now." },
      {
        headers: { "Cache-Control": "private, no-store" },
        status: 500,
      },
    );
  }
}
