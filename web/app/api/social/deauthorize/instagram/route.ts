import { api } from "@/convex/_generated/api";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { encryptSocialToken } from "@/lib/clipstitchr/server/social/encryptSocialToken";
import { readInstagramSignedRequestFromRequest } from "@/lib/clipstitchr/server/social/readInstagramSignedRequestFromRequest";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await readInstagramSignedRequestFromRequest(request);
    const redacted = encryptSocialToken(`revoked:instagram:${payload.user_id}`);
    const convex = createConvexHttpClient();
    const secret = getRateLimitApiSecret();
    const now = new Date().toISOString();

    await convex.mutation(api.rateLimits.consumeSocialWebhook, {
      platform: "instagram",
      secret,
    });
    await convex.mutation(
      api.socialAccounts.revokeSocialAccountFromWebhook
        .revokeSocialAccountFromWebhook,
      {
        secret,
        platform: "instagram",
        externalAccountId: payload.user_id,
        redactedAccessTokenCiphertext: redacted.ciphertext,
        tokenEncryptionVersion: redacted.version,
        reason: "Instagram removed this account's authorization.",
        now,
      },
    );

    return Response.json({ received: true });
  } catch (error) {
    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return Response.json(
      { error: "Unable to process this Instagram deauthorization." },
      { status: 400 },
    );
  }
}
