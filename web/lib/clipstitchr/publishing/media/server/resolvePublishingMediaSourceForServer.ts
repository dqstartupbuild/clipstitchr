import type { ConvexHttpClient } from "convex/browser";
import { parsePublishingMediaSourceDescriptor } from "@/lib/clipstitchr/publishing/media/parsePublishingMediaSourceDescriptor";
import type { PublishingMediaHeadClient } from "@/lib/clipstitchr/publishing/media/server/PublishingMediaHeadClient";
import { enrichPublishingMediaRecordWithR2Head } from "@/lib/clipstitchr/publishing/media/server/enrichPublishingMediaRecordWithR2Head";
import { getOwnedPublishingMediaRecordFromConvex } from "@/lib/clipstitchr/publishing/media/server/getOwnedPublishingMediaRecordFromConvex";
import { PublishingMediaValidationError } from "@/lib/clipstitchr/publishing/media/PublishingMediaValidationError";
import type { ResolvedPublishingMediaSource } from "@/lib/clipstitchr/publishing/media/ResolvedPublishingMediaSource";
import { resolveOwnedPublishingMediaSource } from "@/lib/clipstitchr/publishing/media/resolveOwnedPublishingMediaSource";

type ResolvePublishingMediaSourceForServerOptions = {
  bucketName: string;
  convex: ConvexHttpClient;
  descriptor: unknown;
  headClient: PublishingMediaHeadClient;
};

export async function resolvePublishingMediaSourceForServer({
  bucketName,
  convex,
  descriptor: unsafeDescriptor,
  headClient,
}: ResolvePublishingMediaSourceForServerOptions): Promise<ResolvedPublishingMediaSource> {
  const descriptor = parsePublishingMediaSourceDescriptor(unsafeDescriptor);
  const record = await getOwnedPublishingMediaRecordFromConvex(
    convex,
    descriptor,
  );

  if (!record) {
    throw new PublishingMediaValidationError(
      "missing_media",
      "This saved media is unavailable or not ready to publish.",
    );
  }

  const enrichedRecord = await enrichPublishingMediaRecordWithR2Head({
    bucketName,
    headClient,
    record,
  });

  return resolveOwnedPublishingMediaSource({
    descriptor,
    ownerId: enrichedRecord.ownerId,
    record: enrichedRecord,
  });
}
