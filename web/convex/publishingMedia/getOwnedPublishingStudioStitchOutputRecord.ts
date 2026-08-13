import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { PublishingMediaRecord } from "./PublishingMediaRecord";

export async function getOwnedPublishingStudioStitchOutputRecord(
  ctx: MutationCtx | QueryCtx,
  ownerId: string,
  productId: string,
  recordId: string,
): Promise<PublishingMediaRecord | null> {
  const output = await ctx.db
    .query("studioReelOutputs")
    .withIndex("by_owner_product_id", (index) =>
      index
        .eq("ownerId", ownerId)
        .eq("productId", productId)
        .eq("id", recordId),
    )
    .unique();

  if (!output || output.status !== "accepted") {
    return null;
  }

  return {
    durability: "durable",
    kind: "studio-stitch-output",
    mediaObjects: [
      {
        contentType: output.contentType,
        durationSeconds: output.durationSeconds,
        objectKey: output.objectKey,
        sizeBytes: output.byteLength,
      },
    ],
    ownerId,
    recordId: output.id,
  };
}
