import type { PublishingMediaDescriptor } from "@/lib/clipstitchr/publishing/client/contracts/PublishingMediaDescriptor";

export type PublishingThumbnailSelection = {
  media: PublishingMediaDescriptor;
  mediaRevision: string;
};
