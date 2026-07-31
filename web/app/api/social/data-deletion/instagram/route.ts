import { randomUUID } from "node:crypto";
import { api } from "@/convex/_generated/api";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { encryptSocialToken } from "@/lib/clipstitchr/server/social/encryptSocialToken";
import { getSocialPublicBaseUrl } from "@/lib/clipstitchr/server/social/getSocialPublicBaseUrl";
import { readInstagramSignedRequestFromRequest } from "@/lib/clipstitchr/server/social/readInstagramSignedRequestFromRequest";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await readInstagramSignedRequestFromRequest(request);
    const confirmationCode = randomUUID();
    const redacted = encryptSocialToken(
      `deleted:instagram:${payload.user_id}`,
    );
    const convex = createConvexHttpClient();
    const secret = getRateLimitApiSecret();

    await convex.mutation(api.rateLimits.consumeSocialWebhook, {
      platform: "instagram",
      secret,
    });

    await convex.mutation(
      api.socialDataDeletion.processSocialDataDeletionRequest
        .processSocialDataDeletionRequest,
      {
        secret,
        id: `social-deletion:${randomUUID()}`,
        platform: "instagram",
        externalAccountId: payload.user_id,
        confirmationCode,
        redactedAccessTokenCiphertext: redacted.ciphertext,
        tokenEncryptionVersion: redacted.version,
        now: new Date().toISOString(),
      },
    );

    return Response.json({
      confirmation_code: confirmationCode,
      url: `${getSocialPublicBaseUrl()}/api/social/data-deletion/status/${confirmationCode}`,
    });
  } catch (error) {
    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return Response.json(
      { error: "Unable to process this data deletion request." },
      { status: 400 },
    );
  }
}
