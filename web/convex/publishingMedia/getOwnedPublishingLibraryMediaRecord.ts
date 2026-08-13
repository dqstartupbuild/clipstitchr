import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { PublishingMediaRecord } from "./PublishingMediaRecord";

export async function getOwnedPublishingLibraryMediaRecord(
  ctx: MutationCtx | QueryCtx,
  ownerId: string,
  productId: string,
  recordId: string,
): Promise<PublishingMediaRecord | null> {
  const clip = await ctx.db
    .query("videoClips")
    .withIndex("by_owner_id", (index) =>
      index.eq("ownerId", ownerId).eq("id", recordId),
    )
    .unique();

  if (!clip || clip.productId !== productId) {
    const photo = await ctx.db
      .query("photoAssets")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", recordId),
      )
      .unique();

    if (!photo || photo.productId !== productId) {
      return null;
    }

    return {
      durability: "durable",
      kind: "library-media",
      mediaObjects: [
        {
          contentType: photo.photoObject.contentType,
          height: photo.height,
          objectKey: photo.photoObject.key,
          sizeBytes: photo.photoObject.size,
          width: photo.width,
        },
      ],
      ownerId,
      recordId: photo.id,
    };
  }

  return {
    durability: "durable",
    kind: "library-media",
    mediaObjects: [
      {
        contentType: clip.videoObject.contentType,
        durationSeconds: clip.duration,
        hasAudio: clip.hasAudio,
        height: clip.height,
        objectKey: clip.videoObject.key,
        sizeBytes: clip.videoObject.size,
        width: clip.width,
      },
    ],
    ownerId,
    recordId: clip.id,
  };
}
