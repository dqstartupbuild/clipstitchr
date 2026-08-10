import type { SocialPublishingMediaUploadDescriptor } from "@/lib/clipstitchr/types/SocialPublishingMediaUploadDescriptor";

export type SocialPublishingUploadedMedia = SocialPublishingMediaUploadDescriptor & {
  mediaId: string;
};
