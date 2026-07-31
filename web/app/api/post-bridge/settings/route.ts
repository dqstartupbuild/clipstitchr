import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { encryptPostBridgeApiKey } from "@/lib/clipstitchr/server/postBridge/encryptPostBridgeApiKey";
import { getPostBridgeApiKeyHasChanged } from "@/lib/clipstitchr/server/postBridge/getPostBridgeApiKeyHasChanged";
import { getPostBridgeLegacyWriteResponse } from "@/lib/clipstitchr/server/postBridge/getPostBridgeLegacyWriteResponse";
import { listPostBridgeSocialAccounts } from "@/lib/clipstitchr/server/postBridge/listPostBridgeSocialAccounts";
import { readPostBridgeApiKeyInput } from "@/lib/clipstitchr/server/postBridge/readPostBridgeApiKeyInput";
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
      settings: await convex.query(api.postBridgeSettings.getPublic, {}),
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load Post Bridge settings.",
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

  const legacyWriteResponse = getPostBridgeLegacyWriteResponse();

  if (legacyWriteResponse) {
    return legacyWriteResponse;
  }

  try {
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);
    const apiKey = await readPostBridgeApiKeyInput(request);
    const encryptedApiKey = encryptPostBridgeApiKey(apiKey);
    const rateLimitApiSecret = getRateLimitApiSecret();
    const currentSecret = await convex.query(api.postBridgeSettings.getSecret, {
      secret: rateLimitApiSecret,
    });

    await convex.mutation(api.rateLimits.consumePostBridgeRead, {
      secret: rateLimitApiSecret,
    });

    const accounts = await listPostBridgeSocialAccounts(apiKey);
    const now = new Date().toISOString();
    const settings = {
      apiKeyLast4: apiKey.slice(-4),
      hasApiKey: true,
      lastVerifiedAt: now,
      updatedAt: now,
    };

    await convex.mutation(api.postBridgeSettings.saveSecret, {
      apiKeyLast4: settings.apiKeyLast4,
      clearLinkedAccountIds: getPostBridgeApiKeyHasChanged(
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
            : "Unable to save Post Bridge settings.",
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

  const legacyWriteResponse = getPostBridgeLegacyWriteResponse();

  if (legacyWriteResponse) {
    return legacyWriteResponse;
  }

  try {
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    const convex = createAuthenticatedConvexHttpClient(convexToken);

    await convex.mutation(api.postBridgeSettings.clearSecret, {});

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
            : "Unable to remove Post Bridge settings.",
      },
      { status: 400 },
    );
  }
}
