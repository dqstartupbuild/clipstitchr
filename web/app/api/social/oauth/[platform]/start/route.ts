import { randomUUID } from "node:crypto";
import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { createSocialOAuthState } from "@/lib/clipstitchr/server/social/createSocialOAuthState";
import { createSocialSecretHash } from "@/lib/clipstitchr/server/social/createSocialSecretHash";
import { getSocialOAuthAuthorizationUrl } from "@/lib/clipstitchr/server/social/getSocialOAuthAuthorizationUrl";
import { getSocialOAuthRedirectUri } from "@/lib/clipstitchr/server/social/getSocialOAuthRedirectUri";
import { getSocialOAuthReturnPath } from "@/lib/clipstitchr/server/social/getSocialOAuthReturnPath";
import { readSocialRequestBody } from "@/lib/clipstitchr/server/social/readSocialRequestBody";
import { assertInHouseSocialPublishingEnabled } from "@/lib/clipstitchr/social/assertInHouseSocialPublishingEnabled";
import type { SocialPlatform } from "@/lib/clipstitchr/social/types/SocialPlatform";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ platform: string }> },
) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    assertInHouseSocialPublishingEnabled();

    const { platform: platformValue } = await context.params;

    if (platformValue !== "tiktok" && platformValue !== "instagram") {
      return Response.json({ error: "Platform not found." }, { status: 404 });
    }

    const platform = platformValue as SocialPlatform;
    const bodyText = await readSocialRequestBody(request);
    const body = (
      bodyText ? JSON.parse(bodyText) : {}
    ) as {
      returnPath?: unknown;
    };
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to start this account connection.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);
    await convex.mutation(api.rateLimits.consumeSocialOAuthConnect, {
      secret: getRateLimitApiSecret(),
    });

    const state = createSocialOAuthState();
    const now = new Date().toISOString();
    const redirectUri = getSocialOAuthRedirectUri(platform);
    const returnPath = getSocialOAuthReturnPath(body.returnPath);

    await convex.mutation(
      api.socialOAuth.createSocialOAuthState.createSocialOAuthState,
      {
        id: `social-oauth:${randomUUID()}`,
        platform,
        stateHash: createSocialSecretHash(state),
        redirectUri,
        returnPath,
        expiresAt: new Date(Date.parse(now) + 10 * 60_000).toISOString(),
        now,
      },
    );

    return Response.json({
      authorizationUrl: getSocialOAuthAuthorizationUrl({
        platform,
        redirectUri,
        state,
      }),
    });
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
            : "Unable to start this account connection.",
      },
      { status: 400 },
    );
  }
}
