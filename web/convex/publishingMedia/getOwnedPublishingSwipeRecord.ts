import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { PublishingMediaRecord } from "./PublishingMediaRecord";
import { assertSwipePublishingBundleMatchesSwipe } from "../../lib/clipstitchr/publishing/media/assertSwipePublishingBundleMatchesSwipe";
import { createSwipePublishingEditableStateDigest } from "../../lib/clipstitchr/publishing/media/createSwipePublishingEditableStateDigest";

export async function getOwnedPublishingSwipeRecord(
  ctx: MutationCtx | QueryCtx,
  ownerId: string,
  productId: string,
  recordId: string,
): Promise<PublishingMediaRecord | null> {
  const swipe = await ctx.db
    .query("swipes")
    .withIndex("by_owner_id", (index) =>
      index.eq("ownerId", ownerId).eq("id", recordId),
    )
    .unique();

  if (
    !swipe?.publishingBundle ||
    !swipe.publishingRevision ||
    swipe.productSourceId !== productId
  ) {
    return null;
  }

  const editableStateDigest =
    await createSwipePublishingEditableStateDigest(swipe);

  if (
    swipe.publishingRevision !== swipe.publishingBundle.revision ||
    swipe.publishingBundle.editableStateDigest !== editableStateDigest
  ) {
    return null;
  }

  try {
    assertSwipePublishingBundleMatchesSwipe({
      bundle: swipe.publishingBundle,
      ownerId,
      revision: swipe.publishingBundle.revision,
      slideCount: swipe.slides.length,
      swipeId: swipe.id,
    });
  } catch {
    return null;
  }

  return {
    durability: "durable",
    kind: "swipe",
    mediaObjects: swipe.publishingBundle.slides.map((slide) => ({
      checksum: `sha256:${slide.checksumSha256}`,
      contentType: slide.object.contentType,
      height: slide.height,
      objectKey: slide.object.key,
      sizeBytes: slide.object.size,
      ...(slide.versionId || slide.etag
        ? {
            version: [
              ...(slide.versionId ? [`version:${slide.versionId}`] : []),
              ...(slide.etag ? [`etag:${slide.etag}`] : []),
            ].join("|"),
          }
        : {}),
      width: slide.width,
    })),
    ownerId,
    recordId: swipe.id,
  };
}
