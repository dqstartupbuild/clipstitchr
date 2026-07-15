import { api } from "@/convex/_generated/api";
import { getLoopsReadiness } from "@/lib/clipstitchr/email/loops/getLoopsReadiness";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { getPublicToolGateMetadata } from "@/lib/clipstitchr/tools/catalog/getPublicToolGateMetadata";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";
import type { PublicToolKey } from "@/lib/clipstitchr/tools/catalog/PublicToolKey";
import { createToolLeadClientKey } from "@/lib/clipstitchr/tools/toolLeads/server/createToolLeadClientKey";
import { createEmailNativeEnrollmentRateLimitResponse } from "@/lib/clipstitchr/tools/toolLeads/server/createEmailNativeEnrollmentRateLimitResponse";
import { createEmailNativeEnrollmentAcceptedResponse } from "@/lib/clipstitchr/tools/toolLeads/server/createEmailNativeEnrollmentAcceptedResponse";
import { getToolLeadRequestIsSameOrigin } from "@/lib/clipstitchr/tools/toolLeads/server/getToolLeadRequestIsSameOrigin";
import { hashCourseAccessSessionToken } from "@/lib/clipstitchr/tools/courses/session/hashCourseAccessSessionToken";
import { readCourseAccessSessionToken } from "@/lib/clipstitchr/tools/courses/session/readCourseAccessSessionToken";

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
    const courseSessionToken = readCourseAccessSessionToken(request);

    if (variant !== "hybrid-v1" || !courseSessionToken) {
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
        courseSessionTokenHash:
          await hashCourseAccessSessionToken(courseSessionToken),
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
