import type { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";
import { assertPostBridgePlatformMediaKind } from "@/lib/clipstitchr/server/postBridge/assertPostBridgePlatformMediaKind";
import { assertPostBridgeSourceMediaKind } from "@/lib/clipstitchr/server/postBridge/assertPostBridgeSourceMediaKind";
import { createPostBridgePost } from "@/lib/clipstitchr/server/postBridge/createPostBridgePost";
import { createPostBridgePostReference } from "@/lib/clipstitchr/server/postBridge/createPostBridgePostReference";
import { decryptPostBridgeApiKey } from "@/lib/clipstitchr/server/postBridge/decryptPostBridgeApiKey";
import { getPostBridgeAccountPlatforms } from "@/lib/clipstitchr/server/postBridge/getPostBridgeAccountPlatforms";
import { getSelectedPostBridgeAccounts } from "@/lib/clipstitchr/server/postBridge/getSelectedPostBridgeAccounts";
import { listPostBridgeSocialAccounts } from "@/lib/clipstitchr/server/postBridge/listPostBridgeSocialAccounts";
import { parsePostBridgeBatchJobInput } from "@/lib/clipstitchr/server/postBridge/parsePostBridgeBatchJobInput";
import { removePostBridgeTitleLineFromCaption } from "@/lib/clipstitchr/server/postBridge/removePostBridgeTitleLineFromCaption";
import { resolvePostBridgeMediaKindForUploadedMedia } from "@/lib/clipstitchr/server/postBridge/resolvePostBridgeMediaKindForUploadedMedia";
import { uploadPostBridgeMediaFromR2Object } from "@/lib/clipstitchr/server/postBridge/uploadPostBridgeMediaFromR2Object";
import { deleteR2Objects } from "@/lib/clipstitchr/server/r2/deleteR2Objects";

const api = anyApi;

type PostBridgeBatchProviderJob = {
  id: string;
  inputSnapshotJson: string;
  outputAssetIds: string[];
  ownerId: string;
};

type ProcessPostBridgeBatchOptions = {
  client: ConvexHttpClient;
  job: PostBridgeBatchProviderJob;
  providerWorkerSecret: string;
};

export async function processPostBridgeBatch({
  client,
  job,
  providerWorkerSecret,
}: ProcessPostBridgeBatchOptions) {
  const input = parsePostBridgeBatchJobInput(job.inputSnapshotJson);
  const settings = await client.query(
    api.postBridgeSettings.getSecretForProvider,
    {
      ownerId: job.ownerId,
      secret: providerWorkerSecret,
    },
  );

  if (!settings?.encryptedApiKey) {
    throw new Error(
      "Add your Post Bridge API key in Account settings before scheduling.",
    );
  }

  const apiKey = decryptPostBridgeApiKey(settings.encryptedApiKey);
  const selectedAccounts = getSelectedPostBridgeAccounts(
    await listPostBridgeSocialAccounts(apiKey),
    input.socialAccountIds,
  );
  const socialAccountIds = selectedAccounts.map((account) => account.id);
  const platforms = getPostBridgeAccountPlatforms(selectedAccounts);
  const completedSourceIds = new Set(job.outputAssetIds);

  for (let index = 0; index < input.items.length; index += 1) {
    const item = input.items[index];

    if (completedSourceIds.has(item.sourceId)) {
      continue;
    }

    const source =
      item.sourceType === "stitch"
        ? await client.query(api.stitches.getForProvider, {
            id: item.sourceId,
            ownerId: job.ownerId,
            secret: providerWorkerSecret,
          })
        : await client.query(api.swipes.getForProvider, {
            id: item.sourceId,
            ownerId: job.ownerId,
            secret: providerWorkerSecret,
          });

    if (!source) {
      throw new Error("One of the selected posts was not found.");
    }

    const uploadedMedia = [];

    for (const preparedMedia of item.mediaFiles) {
      uploadedMedia.push(
        await uploadPostBridgeMediaFromR2Object({
          apiKey,
          deleteSourceObject: false,
          media: preparedMedia.media,
          sourceObject: preparedMedia.sourceObject,
          userId: job.ownerId,
        }),
      );
    }

    const mediaKind =
      resolvePostBridgeMediaKindForUploadedMedia(uploadedMedia);
    assertPostBridgeSourceMediaKind(item.sourceType, mediaKind);
    assertPostBridgePlatformMediaKind(mediaKind, platforms);
    const mediaIds = uploadedMedia.map((mediaFile) => mediaFile.mediaId);
    const post = await createPostBridgePost({
      apiKey,
      caption: item.caption,
      mediaIds,
      platforms,
      scheduledAt: null,
      socialAccountIds,
      tiktokCaption:
        item.sourceType === "swipe"
          ? removePostBridgeTitleLineFromCaption({
              caption: item.caption,
              title: item.title,
            })
          : undefined,
      title: item.title,
      useQueue: true,
    });
    const postReference = createPostBridgePostReference({
      hasAudio: item.hasAudio,
      mediaIds,
      mediaKind,
      platforms,
      post,
      scheduledAt: null,
      socialAccountIds,
      sourceType: item.sourceType,
    });
    const mutation =
      item.sourceType === "stitch"
        ? api.stitches.addPostBridgePostFromProvider
        : api.swipes.addPostBridgePostFromProvider;

    await client.mutation(mutation, {
      id: item.sourceId,
      ownerId: job.ownerId,
      post: postReference,
      secret: providerWorkerSecret,
    });
    await client.mutation(api.providerJobs.markProviderStatus, {
      id: job.id,
      outputAssetId: item.sourceId,
      ownerId: job.ownerId,
      progress: (index + 1) / input.items.length,
      providerJobId: post.id,
      secret: providerWorkerSecret,
      stage: "scheduling",
      status: "running",
      updatedAt: new Date().toISOString(),
    });
    await deleteR2Objects(
      item.mediaFiles.map(({ sourceObject }) => sourceObject.key),
    ).catch(() => undefined);
  }

  await client.mutation(api.providerJobs.markProviderStatus, {
    id: job.id,
    ownerId: job.ownerId,
    progress: 1,
    secret: providerWorkerSecret,
    stage: "completed",
    status: "completed",
    updatedAt: new Date().toISOString(),
  });
}
