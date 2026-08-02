import type { PublishingResolvedMediaObjectManifest } from "@/lib/clipstitchr/publishing/api/PublishingResolvedMediaObjectManifest";
import type { PublishingSourceKind } from "@/services/publishing-service/src/persistence/PublishingSourceKind";

export type PublishingResolvedMediaManifest = Readonly<{
  contentChecksum: string;
  objects: readonly PublishingResolvedMediaObjectManifest[];
  sourceKind: PublishingSourceKind;
  sourceRecordId: string;
  sourceRevision: string;
}>;
