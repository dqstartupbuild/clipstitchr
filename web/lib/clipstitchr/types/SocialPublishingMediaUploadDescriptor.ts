import type { SocialPublishingMediaKind } from "@/lib/clipstitchr/types/SocialPublishingMediaKind";

export type SocialPublishingMediaUploadDescriptor = {
  mediaKind: SocialPublishingMediaKind;
  mimeType: string;
  name: string;
  sizeBytes: number;
};
