import { randomUUID } from "node:crypto";
import { api } from "@/convex/_generated/api";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { createSocialSecretHash } from "@/lib/clipstitchr/server/social/createSocialSecretHash";
import { encryptSocialToken } from "@/lib/clipstitchr/server/social/encryptSocialToken";
import { exchangeSocialAuthorizationCode } from "@/lib/clipstitchr/server/social/exchangeSocialAuthorizationCode";
import { assertInHouseSocialPublishingEnabled } from "@/lib/clipstitchr/social/assertInHouseSocialPublishingEnabled";
import type { SocialPlatform } from "@/lib/clipstitchr/social/types/SocialPlatform";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ platform: string }> },
) {
  const requestUrl = new URL(request.url);
  const { platform: platformValue } = await context.params;
  const platform =
    platformValue === "tiktok" || platformValue === "instagram"
      ? (platformValue as SocialPlatform)
      : undefined;
  const fallback = new URL("/dashboard/settings", requestUrl.origin);

  if (!platform) {
    fallback.searchParams.set("social", "connection_failed");
    return Response.redirect(fallback);
  }

  try {
    assertInHouseSocialPublishingEnabled();

    const userId = await getAuthenticatedUserId();

    if (!userId) {
      const signIn = new URL("/sign-in", requestUrl.origin);
      signIn.searchParams.set("redirect_url", request.url);
      return Response.redirect(signIn);
    }

    const state = requestUrl.searchParams.get("state");
    const code = requestUrl.searchParams.get("code");
    const convexToken = await getAuthenticatedConvexToken();

    if (!state || !convexToken) {
      throw new Error("This connection link is incomplete.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const consumed = await convex.mutation(
      api.socialOAuth.consumeSocialOAuthState.consumeSocialOAuthState,
      {
        platform,
        stateHash: createSocialSecretHash(state),
        now: new Date().toISOString(),
      },
    );

    if (!code || requestUrl.searchParams.has("error")) {
      const canceled = new URL(consumed.returnPath, requestUrl.origin);
      canceled.searchParams.set("social", "connection_canceled");
      canceled.searchParams.set("platform", platform);
      return Response.redirect(canceled);
    }

    const profile = await exchangeSocialAuthorizationCode({
      code,
      platform,
      redirectUri: consumed.redirectUri,
    });
    const accessEnvelope = encryptSocialToken(profile.accessToken);
    const refreshEnvelope = profile.refreshToken
      ? encryptSocialToken(profile.refreshToken)
      : undefined;

    if (
      refreshEnvelope &&
      refreshEnvelope.version !== accessEnvelope.version
    ) {
      throw new Error("Social token encryption changed during connection.");
    }

    await convex.mutation(
      api.socialAccounts.upsertSocialAccountFromOAuth
        .upsertSocialAccountFromOAuth,
      {
        id: `social-account:${randomUUID()}`,
        platform,
        externalAccountId: profile.externalAccountId,
        username: profile.username,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        accountType: profile.accountType,
        scopes: profile.scopes,
        accessTokenCiphertext: accessEnvelope.ciphertext,
        accessTokenExpiresAt: profile.accessTokenExpiresAt,
        refreshTokenCiphertext: refreshEnvelope?.ciphertext,
        refreshTokenExpiresAt: profile.refreshTokenExpiresAt,
        tokenEncryptionVersion: accessEnvelope.version,
        now: new Date().toISOString(),
      },
    );

    const success = new URL(consumed.returnPath, requestUrl.origin);
    success.searchParams.set("social", "connected");
    success.searchParams.set("platform", platform);
    return Response.redirect(success);
  } catch {
    fallback.searchParams.set("social", "connection_failed");
    fallback.searchParams.set("platform", platform);
    return Response.redirect(fallback);
  }
}
