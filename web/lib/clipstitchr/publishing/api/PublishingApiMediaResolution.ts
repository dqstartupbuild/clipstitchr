import type { PublishingResolvedMediaManifest } from "@/lib/clipstitchr/publishing/api/PublishingResolvedMediaManifest";
import type { PublishingMediaObject } from "@/lib/clipstitchr/publishing/media/PublishingMediaObject";

export type PublishingApiMediaResolution = Readonly<{
  manifest: PublishingResolvedMediaManifest;
  mediaObjects: readonly PublishingMediaObject[];
}>;
