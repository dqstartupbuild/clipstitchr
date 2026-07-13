import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createCliAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/cli/createCliAuthenticationRequiredResponse";
import { getCliSessionFromRequest } from "@/lib/clipstitchr/server/cli/getCliSessionFromRequest";
import { readCliJsonObject } from "@/lib/clipstitchr/server/cli/readCliJsonObject";
import { readCliOptionalString } from "@/lib/clipstitchr/server/cli/readCliOptionalString";
import { readCliRequiredString } from "@/lib/clipstitchr/server/cli/readCliRequiredString";
import { readCliSocialAccountIds } from "@/lib/clipstitchr/server/cli/readCliSocialAccountIds";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { assertPostBridgePlatformMediaKind } from "@/lib/clipstitchr/server/postBridge/assertPostBridgePlatformMediaKind";
import { createPostBridgeMediaUploadDescriptor } from "@/lib/clipstitchr/server/postBridge/createPostBridgeMediaUploadDescriptor";
import { createPostBridgePost } from "@/lib/clipstitchr/server/postBridge/createPostBridgePost";
import { createPostBridgePostReference } from "@/lib/clipstitchr/server/postBridge/createPostBridgePostReference";
import { decryptPostBridgeApiKey } from "@/lib/clipstitchr/server/postBridge/decryptPostBridgeApiKey";
import { getPostBridgeAccountPlatforms } from "@/lib/clipstitchr/server/postBridge/getPostBridgeAccountPlatforms";
import { getSelectedPostBridgeAccounts } from "@/lib/clipstitchr/server/postBridge/getSelectedPostBridgeAccounts";
import { listPostBridgeSocialAccounts } from "@/lib/clipstitchr/server/postBridge/listPostBridgeSocialAccounts";
import { removePostBridgeTitleLineFromCaption } from "@/lib/clipstitchr/server/postBridge/removePostBridgeTitleLineFromCaption";
import { uploadPostBridgeMediaFromR2Object } from "@/lib/clipstitchr/server/postBridge/uploadPostBridgeMediaFromR2Object";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { createSwiprSwipeSocialDescription } from "@/lib/clipstitchr/utils/createSwiprSwipeSocialDescription";
import { getPostBridgeMediaFileName } from "@/lib/clipstitchr/utils/getPostBridgeMediaFileName";
import { getSwiprPostBridgeTitle } from "@/lib/clipstitchr/utils/getSwiprPostBridgeTitle";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getCliSessionFromRequest(request);

  if (!session) {
    return createCliAuthenticationRequiredResponse();
  }

  try {
    const body = await readCliJsonObject(request);
    const swipeId = readCliRequiredString(body, "swipeId", "Swipe ID");
    const convex = createConvexHttpClient();
    const secret = getRateLimitApiSecret();
    const swipe = await convex.query(api.cliLibrary.getCliSwipe.getCliSwipe, {
      id: swipeId,
      ownerId: session.ownerId,
      secret,
    });

    if (!swipe) {
      throw new Error("Swipe not found.");
    }

    if (!swipe.posterObject) {
      throw new Error(
        "Open this Swipe in the dashboard and save it with photos before queueing from the CLI.",
      );
    }

    const postBridgeSecret = await convex.query(
      api.cliPostBridge.getCliPostBridgeSecret.getCliPostBridgeSecret,
      {
        ownerId: session.ownerId,
        secret,
      },
    );

    if (!postBridgeSecret?.encryptedApiKey) {
      throw new Error(
        "Add your Post Bridge API key in Account settings before queueing posts.",
      );
    }

    const apiKey = decryptPostBridgeApiKey(postBridgeSecret.encryptedApiKey);
    const product = await convex.query(
      api.cliProducts.getCliProduct.getCliProduct,
      {
        id: swipe.productSourceId,
        ownerId: session.ownerId,
        secret,
      },
    );
    const requestedAccountIds = readCliSocialAccountIds(body);
    const selectedAccounts = getSelectedPostBridgeAccounts(
      await listPostBridgeSocialAccounts(apiKey),
      requestedAccountIds.length
        ? requestedAccountIds
        : (product?.postBridgeSocialAccountIds ?? []),
    );
    const platforms = getPostBridgeAccountPlatforms(selectedAccounts);
    const media = createPostBridgeMediaUploadDescriptor({
      mimeType: swipe.posterObject.contentType,
      name: getPostBridgeMediaFileName(swipe.name, "image"),
      sizeBytes: swipe.posterObject.size,
    });

    if (media.mediaKind !== "image") {
      throw new Error("Swipes need a saved image before queueing.");
    }

    assertPostBridgePlatformMediaKind(media.mediaKind, platforms);

    await convex.mutation(
      api.cliRateLimits.consumeCliPostBridgeSchedule.consumeCliPostBridgeSchedule,
      {
        ownerId: session.ownerId,
        secret,
      },
    );

    await convex.mutation(
      api.cliRateLimits.consumeCliPostBridgeMediaUpload
        .consumeCliPostBridgeMediaUpload,
      {
        mediaSizeBytes: media.sizeBytes,
        ownerId: session.ownerId,
        secret,
      },
    );

    const uploadedMedia = await uploadPostBridgeMediaFromR2Object({
      apiKey,
      deleteSourceObject: false,
      media,
      sourceObject: swipe.posterObject,
      userId: session.ownerId,
    });

    const caption =
      readCliOptionalString(body, "caption") ??
      createSwiprSwipeSocialDescription(swipe);
    const title =
      readCliOptionalString(body, "title") ?? getSwiprPostBridgeTitle(swipe);
    const post = await createPostBridgePost({
      apiKey,
      caption,
      mediaIds: [uploadedMedia.mediaId],
      platforms,
      scheduledAt: null,
      socialAccountIds: selectedAccounts.map((account) => account.id),
      tiktokCaption: removePostBridgeTitleLineFromCaption({ caption, title }),
      title,
      useQueue: true,
    });
    const postReference = createPostBridgePostReference({
      hasAudio: false,
      mediaIds: [uploadedMedia.mediaId],
      mediaKind: "image",
      platforms,
      post,
      scheduledAt: null,
      socialAccountIds: selectedAccounts.map((account) => account.id),
      sourceType: "swipe",
    });

    await convex.mutation(
      api.cliLibrary.addCliSwipePostBridgePost.addCliSwipePostBridgePost,
      {
        id: swipe.id,
        ownerId: session.ownerId,
        post: postReference,
        secret,
      },
    );

    return NextResponse.json({
      post,
      postReference,
      uploadedMedia,
    });
  } catch (error) {
    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to add this Swipe to your queue.",
      },
      { status: 400 },
    );
  }
}
