import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { PublishingMediaRecord } from "./PublishingMediaRecord";

export async function getOwnedPublishingStitchRecord(
  ctx: MutationCtx | QueryCtx,
  ownerId: string,
  productId: string,
  recordId: string,
): Promise<PublishingMediaRecord | null> {
  const stitch = await ctx.db
    .query("stitches")
    .withIndex("by_owner_id", (index) =>
      index.eq("ownerId", ownerId).eq("id", recordId),
    )
    .unique();

  if (!stitch?.stitchObject || stitch.productId !== productId) {
    return null;
  }

  return {
    durability: "durable",
    kind: "stitch",
    mediaObjects: [
      {
        contentType: stitch.stitchObject.contentType,
        durationSeconds: stitch.duration,
        height: stitch.height,
        objectKey: stitch.stitchObject.key,
        sizeBytes: stitch.stitchObject.size,
        width: stitch.width,
      },
    ],
    ownerId,
    recordId: stitch.id,
  };
}
