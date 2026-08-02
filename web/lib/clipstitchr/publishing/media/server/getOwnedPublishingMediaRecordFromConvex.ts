import type { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import type { OwnedPublishingMediaRecord } from "@/lib/clipstitchr/publishing/media/OwnedPublishingMediaRecord";
import type { PublishingMediaSourceDescriptor } from "@/lib/clipstitchr/publishing/media/PublishingMediaSourceDescriptor";

export async function getOwnedPublishingMediaRecordFromConvex(
  convex: ConvexHttpClient,
  descriptor: PublishingMediaSourceDescriptor,
): Promise<OwnedPublishingMediaRecord | null> {
  return await convex.query(
    api.publishingMedia.getOwnedPublishingMediaRecord.get,
    descriptor,
  );
}
