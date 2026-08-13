import type { PublishingMediaObject } from "@/lib/clipstitchr/publishing/media/PublishingMediaObject";
import type { PublishingMediaSourceKind } from "@/lib/clipstitchr/publishing/media/PublishingMediaSourceKind";

export type ResolvedPublishingMediaSource = {
  kind: PublishingMediaSourceKind;
  mediaObjects: readonly PublishingMediaObject[];
  ownerId: string;
  recordId: string;
};
