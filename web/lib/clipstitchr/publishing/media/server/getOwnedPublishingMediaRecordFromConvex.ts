import type { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import type { OwnedPublishingMediaRecord } from "@/lib/clipstitchr/publishing/media/OwnedPublishingMediaRecord";
import type { PublishingMediaSourceDescriptor } from "@/lib/clipstitchr/publishing/media/PublishingMediaSourceDescriptor";

export async function getOwnedPublishingMediaRecordFromConvex(
  convex: ConvexHttpClient,
  descriptor: PublishingMediaSourceDescriptor,
  productId: string,
): Promise<OwnedPublishingMediaRecord | null> {
  return await convex.mutation(
    api.publishingMedia.getOwnedPublishingMediaRecord.get,
    { ...descriptor, productId },
  );
}
