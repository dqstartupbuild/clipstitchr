import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { decryptSocialToken } from "@/lib/clipstitchr/server/social/decryptSocialToken";
import { encryptSocialToken } from "@/lib/clipstitchr/server/social/encryptSocialToken";
import { revokeSocialAuthorization } from "@/lib/clipstitchr/server/social/revokeSocialAuthorization";
import { assertInHouseSocialPublishingEnabled } from "@/lib/clipstitchr/social/assertInHouseSocialPublishingEnabled";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    assertInHouseSocialPublishingEnabled();

    const { id } = await context.params;
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to disconnect this account.");
    }

    const secret = getRateLimitApiSecret();
    const convex = createAuthenticatedConvexHttpClient(convexToken);
    await convex.mutation(api.rateLimits.consumeSocialAccountDisconnect, {
      secret,
    });
    const account = await convex.query(
      api.socialAccounts.getSocialAccountForServer.getSocialAccountForServer,
      { secret, id },
    );

    if (!account) {
      return Response.json(
        { error: "Connected account not found." },
        { status: 404 },
      );
    }

    const accessToken = decryptSocialToken(
      account.accessTokenCiphertext,
      account.tokenEncryptionVersion,
    );
    await revokeSocialAuthorization({
      accessToken,
      externalAccountId: account.externalAccountId,
      platform: account.platform,
    });

    const redacted = encryptSocialToken(
      `revoked:${account.platform}:${account.externalAccountId}`,
    );
    const result = await convex.mutation(
      api.socialAccounts.disconnectSocialAccount.disconnectSocialAccount,
      {
        secret,
        id,
        redactedAccessTokenCiphertext: redacted.ciphertext,
        tokenEncryptionVersion: redacted.version,
        now: new Date().toISOString(),
      },
    );

    return Response.json(result);
  } catch (error) {
    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to disconnect this account.",
      },
      { status: 400 },
    );
  }
}
