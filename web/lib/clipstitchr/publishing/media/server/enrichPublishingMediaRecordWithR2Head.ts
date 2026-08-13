import type { OwnedPublishingMediaRecord } from "@/lib/clipstitchr/publishing/media/OwnedPublishingMediaRecord";
import { enrichPublishingMediaObjectWithR2Head } from "@/lib/clipstitchr/publishing/media/server/enrichPublishingMediaObjectWithR2Head";
import type { PublishingMediaHeadClient } from "@/lib/clipstitchr/publishing/media/server/PublishingMediaHeadClient";

type EnrichPublishingMediaRecordWithR2HeadOptions = {
  bucketName: string;
  headClient: PublishingMediaHeadClient;
  record: OwnedPublishingMediaRecord;
};

export async function enrichPublishingMediaRecordWithR2Head({
  bucketName,
  headClient,
  record,
}: EnrichPublishingMediaRecordWithR2HeadOptions): Promise<OwnedPublishingMediaRecord> {
  const mediaObjects = await Promise.all(
    record.mediaObjects.map((mediaObject) =>
      enrichPublishingMediaObjectWithR2Head({
        bucketName,
        descriptor: { kind: record.kind, recordId: record.recordId },
        headClient,
        mediaObject,
        ownerId: record.ownerId,
      }),
    ),
  );

  return {
    ...record,
    mediaObjects,
  };
}
