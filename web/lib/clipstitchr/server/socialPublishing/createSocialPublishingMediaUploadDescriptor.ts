import { getSocialPublishingMaxMediaBytes } from "@/lib/clipstitchr/server/socialPublishing/getSocialPublishingMaxMediaBytes";
import { getSocialPublishingMediaKindFromMimeType } from "@/lib/clipstitchr/server/socialPublishing/getSocialPublishingMediaKindFromMimeType";
import { normalizeSocialPublishingMediaMimeType } from "@/lib/clipstitchr/server/socialPublishing/normalizeSocialPublishingMediaMimeType";
import type { SocialPublishingMediaUploadDescriptor } from "@/lib/clipstitchr/types/SocialPublishingMediaUploadDescriptor";

type CreateSocialPublishingMediaUploadDescriptorOptions = {
  mimeType: string;
  name: string;
  sizeBytes: number;
};

export function createSocialPublishingMediaUploadDescriptor({
  mimeType,
  name,
  sizeBytes,
}: CreateSocialPublishingMediaUploadDescriptorOptions): SocialPublishingMediaUploadDescriptor {
  const normalizedMimeType = normalizeSocialPublishingMediaMimeType(mimeType);
  const mediaKind = getSocialPublishingMediaKindFromMimeType(normalizedMimeType);
  const roundedSizeBytes = Math.ceil(sizeBytes);

  if (!mediaKind) {
    throw new Error("Zernio supports PNG, JPEG, MP4, or MOV media.");
  }

  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    throw new Error("Choose media before scheduling.");
  }

  if (roundedSizeBytes > getSocialPublishingMaxMediaBytes()) {
    throw new Error("That media file is too large to schedule.");
  }

  return {
    mediaKind,
    mimeType: normalizedMimeType,
    name: name.trim() || "clipstitchr-post",
    sizeBytes: roundedSizeBytes,
  };
}
