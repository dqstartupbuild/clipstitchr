import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { PublishingMediaRecord } from "./PublishingMediaRecord";

export async function getOwnedPublishingStudioClipOutputRecord(
  ctx: MutationCtx | QueryCtx,
  ownerId: string,
  productId: string,
  recordId: string,
): Promise<PublishingMediaRecord | null> {
  const output = await ctx.db
    .query("studioClipsOutputs")
    .withIndex("by_owner_product_id", (index) =>
      index
        .eq("ownerId", ownerId)
        .eq("productId", productId)
        .eq("id", recordId),
    )
    .unique();

  if (!output) {
    return null;
  }

  const task = await ctx.db
    .query("studioClipsTasks")
    .withIndex("by_owner_product_id", (index) =>
      index
        .eq("ownerId", ownerId)
        .eq("productId", productId)
        .eq("id", output.taskId),
    )
    .unique();

  if (!task || task.status !== "completed") {
    return null;
  }

  return {
    durability: "durable",
    kind: "studio-clip-output",
    mediaObjects: [
      {
        ...(output.audioCodec ? { audioCodec: output.audioCodec } : {}),
        contentType: output.contentType,
        ...(output.durationSeconds === undefined
          ? {}
          : { durationSeconds: output.durationSeconds }),
        ...(output.hasAudio === undefined ? {} : { hasAudio: output.hasAudio }),
        ...(output.height === undefined ? {} : { height: output.height }),
        objectKey: output.objectKey,
        sizeBytes: output.sizeBytes,
        ...(output.videoCodec ? { videoCodec: output.videoCodec } : {}),
        ...(output.width === undefined ? {} : { width: output.width }),
      },
    ],
    ownerId,
    recordId: output.id,
  };
}
