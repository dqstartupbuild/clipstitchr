import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createCliAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/cli/createCliAuthenticationRequiredResponse";
import { getCliSessionFromRequest } from "@/lib/clipstitchr/server/cli/getCliSessionFromRequest";
import { readCliJsonObject } from "@/lib/clipstitchr/server/cli/readCliJsonObject";
import { readCliOptionalString } from "@/lib/clipstitchr/server/cli/readCliOptionalString";
import { readCliRequiredString } from "@/lib/clipstitchr/server/cli/readCliRequiredString";
import { readCliSocialAccountIds } from "@/lib/clipstitchr/server/cli/readCliSocialAccountIds";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { createPostBridgeMediaUploadDescriptor } from "@/lib/clipstitchr/server/postBridge/createPostBridgeMediaUploadDescriptor";
import { createPostBridgePost } from "@/lib/clipstitchr/server/postBridge/createPostBridgePost";
import { createPostBridgePostReference } from "@/lib/clipstitchr/server/postBridge/createPostBridgePostReference";
import { decryptPostBridgeApiKey } from "@/lib/clipstitchr/server/postBridge/decryptPostBridgeApiKey";
import { getPostBridgeAccountPlatforms } from "@/lib/clipstitchr/server/postBridge/getPostBridgeAccountPlatforms";
import { getSelectedPostBridgeAccounts } from "@/lib/clipstitchr/server/postBridge/getSelectedPostBridgeAccounts";
import { listPostBridgeSocialAccounts } from "@/lib/clipstitchr/server/postBridge/listPostBridgeSocialAccounts";
import { uploadPostBridgeMediaFromR2Object } from "@/lib/clipstitchr/server/postBridge/uploadPostBridgeMediaFromR2Object";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { getPostBridgeMediaFileName } from "@/lib/clipstitchr/utils/getPostBridgeMediaFileName";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getCliSessionFromRequest(request);

  if (!session) {
    return createCliAuthenticationRequiredResponse();
  }

  try {
    const body = await readCliJsonObject(request);
    const stitchId = readCliRequiredString(body, "stitchId", "Stitch ID");
    const convex = createConvexHttpClient();
    const secret = getRateLimitApiSecret();
    const stitch = await convex.query(api.cliLibrary.getCliStitch.getCliStitch, {
      id: stitchId,
      ownerId: session.ownerId,
      secret,
    });

    if (!stitch) {
      throw new Error("Stitch not found.");
    }

    if (!stitch.stitchObject) {
      throw new Error("That Stitch is still rendering. Try again when it is ready.");
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
    const product = stitch.productId
      ? await convex.query(api.cliProducts.getCliProduct.getCliProduct, {
          id: stitch.productId,
          ownerId: session.ownerId,
          secret,
        })
      : null;
    const requestedAccountIds = readCliSocialAccountIds(body);
    const selectedAccounts = getSelectedPostBridgeAccounts(
      await listPostBridgeSocialAccounts(apiKey),
      requestedAccountIds.length
        ? requestedAccountIds
        : (product?.postBridgeSocialAccountIds ?? []),
    );
    const platforms = getPostBridgeAccountPlatforms(selectedAccounts);
    const media = createPostBridgeMediaUploadDescriptor({
      mimeType: stitch.stitchObject.contentType,
      name: getPostBridgeMediaFileName(stitch.name, "video"),
      sizeBytes: stitch.stitchObject.size,
    });

    if (media.mediaKind !== "video") {
      throw new Error("Stitches need a finished video before queueing.");
    }

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
      sourceObject: stitch.stitchObject,
      userId: session.ownerId,
    });

    const caption =
      readCliOptionalString(body, "caption") ?? stitch.socialCaption ?? "";
    const title = readCliOptionalString(body, "title") ?? stitch.name;
    const post = await createPostBridgePost({
      apiKey,
      caption,
      mediaIds: [uploadedMedia.mediaId],
      platforms,
      scheduledAt: null,
      socialAccountIds: selectedAccounts.map((account) => account.id),
      title,
      useQueue: true,
    });
    const postReference = createPostBridgePostReference({
      hasAudio: Boolean(
        stitch.music?.enabled ||
          stitch.includeUgcAudio !== false ||
          stitch.includeDemoAudio !== false,
      ),
      mediaIds: [uploadedMedia.mediaId],
      mediaKind: "video",
      platforms,
      post,
      scheduledAt: null,
      socialAccountIds: selectedAccounts.map((account) => account.id),
      sourceType: "stitch",
    });

    await convex.mutation(
      api.cliLibrary.addCliStitchPostBridgePost.addCliStitchPostBridgePost,
      {
        id: stitch.id,
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
            : "Unable to add this Stitch to your queue.",
      },
      { status: 400 },
    );
  }
}
