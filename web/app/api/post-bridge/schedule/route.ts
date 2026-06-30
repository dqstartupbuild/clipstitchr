import { api } from "@/convex/_generated/api";
import { capturePostHogServerEvent } from "@/lib/clipstitchr/server/analytics/capturePostHogServerEvent";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { assertPostBridgePlatformMediaKind } from "@/lib/clipstitchr/server/postBridge/assertPostBridgePlatformMediaKind";
import { assertPostBridgeSourceMediaKind } from "@/lib/clipstitchr/server/postBridge/assertPostBridgeSourceMediaKind";
import { createPostBridgePost } from "@/lib/clipstitchr/server/postBridge/createPostBridgePost";
import { createPostBridgePostReference } from "@/lib/clipstitchr/server/postBridge/createPostBridgePostReference";
import { getPostBridgeAccountPlatforms } from "@/lib/clipstitchr/server/postBridge/getPostBridgeAccountPlatforms";
import { getPostBridgeUploadedMediaSizeBytes } from "@/lib/clipstitchr/server/postBridge/getPostBridgeUploadedMediaSizeBytes";
import { getPostBridgeSourceProductId } from "@/lib/clipstitchr/server/postBridge/getPostBridgeSourceProductId";
import { getSelectedPostBridgeAccounts } from "@/lib/clipstitchr/server/postBridge/getSelectedPostBridgeAccounts";
import { listPostBridgeSocialAccounts } from "@/lib/clipstitchr/server/postBridge/listPostBridgeSocialAccounts";
import { readPostBridgeScheduleRequest } from "@/lib/clipstitchr/server/postBridge/readPostBridgeScheduleRequest";
import { removePostBridgeTitleLineFromCaption } from "@/lib/clipstitchr/server/postBridge/removePostBridgeTitleLineFromCaption";
import { resolvePostBridgeApiKey } from "@/lib/clipstitchr/server/postBridge/resolvePostBridgeApiKey";
import { resolvePostBridgeMediaKindForUploadedMedia } from "@/lib/clipstitchr/server/postBridge/resolvePostBridgeMediaKindForUploadedMedia";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";

export const runtime = "nodejs";

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
    const input = await readPostBridgeScheduleRequest(request);
    const source =
      input.sourceType === "stitch"
        ? await convex.query(api.stitches.get, { id: input.sourceId })
        : await convex.query(api.swipes.get, { id: input.sourceId });

    if (!source) {
      throw new Error("That saved post was not found.");
    }

    const mediaKind = resolvePostBridgeMediaKindForUploadedMedia(input.mediaFiles);
    assertPostBridgeSourceMediaKind(input.sourceType, mediaKind);
    const mediaSizeBytes = getPostBridgeUploadedMediaSizeBytes(input.mediaFiles);

    await convex.mutation(api.rateLimits.consumePostBridgeSchedule, {
      secret: getRateLimitApiSecret(),
    });

    const sourceProductId = getPostBridgeSourceProductId(
      input.sourceType,
      source,
    );
    const product = sourceProductId
      ? await convex.query(api.products.get, { id: sourceProductId })
      : null;
    const linkedAccountIds = product?.postBridgeSocialAccountIds ?? [];
    const accountIds = input.socialAccountIds.length
      ? input.socialAccountIds
      : linkedAccountIds;
    const apiKey = await resolvePostBridgeApiKey(convex);
    const selectedAccounts = getSelectedPostBridgeAccounts(
      await listPostBridgeSocialAccounts(apiKey),
      accountIds,
    );
    const platforms = getPostBridgeAccountPlatforms(selectedAccounts);
    assertPostBridgePlatformMediaKind(mediaKind, platforms);
    const mediaIds = input.mediaFiles.map((mediaFile) => mediaFile.mediaId);

    const post = await createPostBridgePost({
      apiKey,
      caption: input.caption,
      mediaIds,
      platforms,
      scheduledAt: input.scheduledAt,
      socialAccountIds: selectedAccounts.map((account) => account.id),
      tiktokCaption:
        input.sourceType === "swipe"
          ? removePostBridgeTitleLineFromCaption({
              caption: input.caption,
              title: input.title,
            })
          : undefined,
      title: input.title,
    });
    const postReference = createPostBridgePostReference({
      hasAudio: input.hasAudio,
      mediaIds,
      mediaKind,
      platforms,
      post,
      scheduledAt: input.scheduledAt,
      socialAccountIds: selectedAccounts.map((account) => account.id),
      sourceType: input.sourceType,
    });

    if (input.sourceType === "stitch") {
      await convex.mutation(api.stitches.addPostBridgePost, {
        id: input.sourceId,
        post: postReference,
      });
    } else {
      await convex.mutation(api.swipes.addPostBridgePost, {
        id: input.sourceId,
        post: postReference,
      });
    }

    await capturePostHogServerEvent({
      distinctId: userId,
      event: "post_bridge_post_scheduled",
      properties: {
        has_audio: input.hasAudio,
        media_kind: mediaKind,
        media_size_bytes: mediaSizeBytes,
        platform_count: platforms.length,
        post_bridge_post_id: post.id,
        source_id: input.sourceId,
        source_type: input.sourceType,
      },
      request,
    });

    return Response.json({
      post,
      postReference,
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
            : "Unable to schedule this post.",
      },
      { status: 400 },
    );
  }
}
