import type { PublishingMediaObject } from "@/lib/clipstitchr/publishing/media/PublishingMediaObject";
import type { PublishingMediaSourceKind } from "@/lib/clipstitchr/publishing/media/PublishingMediaSourceKind";

export type OwnedPublishingMediaRecord = {
  durability: "durable";
  kind: PublishingMediaSourceKind;
  mediaObjects: readonly PublishingMediaObject[];
  ownerId: string;
  recordId: string;
};
