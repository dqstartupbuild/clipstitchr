import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { encryptSocialPublishingApiKey } from "@/lib/clipstitchr/server/socialPublishing/encryptSocialPublishingApiKey";
import { getSocialPublishingApiKeyHasChanged } from "@/lib/clipstitchr/server/socialPublishing/getSocialPublishingApiKeyHasChanged";
import { listSocialPublishingSocialAccounts } from "@/lib/clipstitchr/server/socialPublishing/listSocialPublishingSocialAccounts";
import { readSocialPublishingApiKeyInput } from "@/lib/clipstitchr/server/socialPublishing/readSocialPublishingApiKeyInput";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";

export const runtime = "nodejs";

export async function GET() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);

    return Response.json({
      settings: await convex.query(api.socialPublishingSettings.getPublic, {}),
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load Zernio settings.",
      },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const apiKey = await readSocialPublishingApiKeyInput(request);
    const encryptedApiKey = encryptSocialPublishingApiKey(apiKey);
    const rateLimitApiSecret = getRateLimitApiSecret();
    const currentSecret = await convex.query(api.socialPublishingSettings.getSecret, {
      secret: rateLimitApiSecret,
    });

    await convex.mutation(api.rateLimits.consumeSocialPublishingRead, {
      secret: rateLimitApiSecret,
    });

    const accounts = await listSocialPublishingSocialAccounts(apiKey);
    const now = new Date().toISOString();
    const settings = {
      apiKeyLast4: apiKey.slice(-4),
      hasApiKey: true,
      lastVerifiedAt: now,
      updatedAt: now,
    };

    await convex.mutation(api.socialPublishingSettings.saveSecret, {
      apiKeyLast4: settings.apiKeyLast4,
      clearLinkedAccountIds: getSocialPublishingApiKeyHasChanged(
        currentSecret?.encryptedApiKey,
        apiKey,
      ),
      encryptedApiKey,
      lastVerifiedAt: now,
      updatedAt: now,
    });

    return Response.json({ accounts, settings });
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
            : "Unable to save Zernio settings.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  try {
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);

    await convex.mutation(api.socialPublishingSettings.clearSecret, {});

    return Response.json({
      settings: {
        hasApiKey: false,
      },
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
            : "Unable to remove Zernio settings.",
      },
      { status: 400 },
    );
  }
}
