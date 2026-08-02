import type { PublishingMediaObject } from "../persistence/PublishingMediaObject.js";
import type { PublishingSourceKind } from "../persistence/PublishingSourceKind.js";

export type PublishingApiMediaManifest = Readonly<{
  contentChecksum: string;
  objects: readonly PublishingMediaObject[];
  sourceKind: PublishingSourceKind;
  sourceRecordId: string;
  sourceRevision: string;
}>;
