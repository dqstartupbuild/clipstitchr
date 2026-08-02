import type { QueryCtx } from "../_generated/server";
import type { PublishingMediaRecord } from "./PublishingMediaRecord";

export async function getOwnedPublishingLibraryMediaRecord(
  ctx: QueryCtx,
  ownerId: string,
  recordId: string,
): Promise<PublishingMediaRecord | null> {
  const clip = await ctx.db
    .query("videoClips")
    .withIndex("by_owner_id", (index) =>
      index.eq("ownerId", ownerId).eq("id", recordId),
    )
    .unique();

  if (!clip) {
    return null;
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
