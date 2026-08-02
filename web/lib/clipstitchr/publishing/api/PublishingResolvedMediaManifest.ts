import type { PublishingResolvedMediaObjectManifest } from "@/lib/clipstitchr/publishing/api/PublishingResolvedMediaObjectManifest";
import type { PublishingSourceKind } from "@clipstitchr/publishing-service";

export type PublishingResolvedMediaManifest = Readonly<{
  contentChecksum: string;
  objects: readonly PublishingResolvedMediaObjectManifest[];
  sourceKind: PublishingSourceKind;
  sourceRecordId: string;
  sourceRevision: string;
}>;
