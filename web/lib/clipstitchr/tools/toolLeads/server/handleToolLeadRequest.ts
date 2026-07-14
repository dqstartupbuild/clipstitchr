import { api } from "@/convex/_generated/api";
import { createProviderContactKey } from "@/lib/clipstitchr/email/contact/createProviderContactKey";
import { createEmailConfirmationToken } from "@/lib/clipstitchr/email/confirmation/createEmailConfirmationToken";
import { getEmailConfirmationTokenSecret } from "@/lib/clipstitchr/email/confirmation/getEmailConfirmationTokenSecret";
import { getLoopsReadiness } from "@/lib/clipstitchr/email/loops/getLoopsReadiness";
import { resolveSiteUrl } from "@/lib/resolveSiteUrl";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { createBrowserRecognitionCookieHeader } from "@/lib/clipstitchr/tools/browserRecognition/createBrowserRecognitionCookieHeader";
import { createBrowserRecognitionToken } from "@/lib/clipstitchr/tools/browserRecognition/createBrowserRecognitionToken";
import { hashBrowserRecognitionToken } from "@/lib/clipstitchr/tools/browserRecognition/hashBrowserRecognitionToken";
import { readBrowserRecognitionToken } from "@/lib/clipstitchr/tools/browserRecognition/readBrowserRecognitionToken";
import { browserRecognitionTtlSeconds } from "@/lib/clipstitchr/tools/browserRecognition/browserRecognitionTtlSeconds";
import { getPublicToolGateMetadata } from "@/lib/clipstitchr/tools/catalog/getPublicToolGateMetadata";
import { resolvePublicToolGateVariantForRequest } from "@/lib/clipstitchr/tools/catalog/rollout/resolvePublicToolGateVariantForRequest";
import { getPublicToolGateRuntimeIsReady } from "@/lib/clipstitchr/tools/catalog/rollout/getPublicToolGateRuntimeIsReady";
import type { ToolLeadSource } from "@/lib/clipstitchr/types/ToolLeadSource";
import { ToolLeadRequestError } from "@/lib/clipstitchr/tools/toolLeads/server/ToolLeadRequestError";
import { createToolLeadClientKey } from "@/lib/clipstitchr/tools/toolLeads/server/createToolLeadClientKey";
import { createToolLeadRateLimitResponse } from "@/lib/clipstitchr/tools/toolLeads/server/createToolLeadRateLimitResponse";
import { getToolLeadRequestIsSameOrigin } from "@/lib/clipstitchr/tools/toolLeads/server/getToolLeadRequestIsSameOrigin";
import { readToolLeadRequest } from "@/lib/clipstitchr/tools/toolLeads/server/readToolLeadRequest";
import { toolLeadConsentCopyVersion } from "@/lib/clipstitchr/tools/toolLeads/toolLeadConsentCopyVersion";

export async function handleToolLeadRequest({
  request,
  source,
}: {
  request: Request;
  source: ToolLeadSource;
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

  try {
    const input = await readToolLeadRequest(request);
    const secret = getRateLimitApiSecret();
    const convex = createConvexHttpClient();
    const clientKey = createToolLeadClientKey(request, secret);
    const readiness = getLoopsReadiness(process.env);
    const requestedVariant = await resolvePublicToolGateVariantForRequest(
      source,
      readiness.emailNativeReady,
    );
    const variant =
      requestedVariant === "hybrid-v1" &&
      getPublicToolGateRuntimeIsReady(source, {
        emailNativeReady: readiness.emailNativeReady,
        hasConfirmationTokenSecret: Boolean(
          process.env.EMAIL_CONFIRMATION_TOKEN_SECRET?.trim(),
        ),
      })
        ? requestedVariant
        : "control";

    if (variant === "control") {
      await convex.mutation(api.toolLeads.submitControl.submitControl, {
        ...input,
        clientKey,
        secret,
        source,
      });

      return Response.json(
        { accepted: true },
        { headers: { "Cache-Control": "private, no-store" } },
      );
    }

    const capturedAt = Date.now();
    const recognitionToken = createBrowserRecognitionToken();
    const previousRecognitionToken = readBrowserRecognitionToken(request);
    const confirmation = await createEmailConfirmationToken(
      resolveSiteUrl(),
      getEmailConfirmationTokenSecret(),
      capturedAt,
    );

    await convex.mutation(api.toolLeads.submit.submit, {
      ...input,
      capturedAt,
      clientKey,
      confirmationExpiresAt: confirmation.expiresAt,
      consentCopyVersion: toolLeadConsentCopyVersion,
      gateMode: getPublicToolGateMetadata(source).mode,
      gateVariant: variant,
      ...(previousRecognitionToken
        ? {
            previousRecognitionTokenHash:
              await hashBrowserRecognitionToken(previousRecognitionToken),
          }
        : {}),
      providerContactKey: createProviderContactKey(),
      recognitionExpiresAt:
        capturedAt + browserRecognitionTtlSeconds * 1_000,
      recognitionTokenHash: await hashBrowserRecognitionToken(recognitionToken),
      secret,
      source,
      tokenDigest: confirmation.tokenDigest,
      tokenRecordId: confirmation.tokenRecordId,
    });

    return Response.json(
      { accepted: true },
      {
        headers: {
          "Cache-Control": "private, no-store",
          "Set-Cookie": createBrowserRecognitionCookieHeader(
            recognitionToken,
            new URL(request.url).protocol === "https:",
          ),
        },
      },
    );
  } catch (error) {
    const rateLimitResponse = createToolLeadRateLimitResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    if (error instanceof ToolLeadRequestError) {
      return Response.json(
        { message: "Check your name and email, then try again." },
        {
          headers: { "Cache-Control": "private, no-store" },
          status: error.status,
        },
      );
    }

    return Response.json(
      { message: "Unable to join the mailing list right now." },
      {
        headers: { "Cache-Control": "private, no-store" },
        status: 500,
      },
    );
  }
}
