import { getSocialPublishingMediaKindFromMimeType } from "@/lib/clipstitchr/server/socialPublishing/getSocialPublishingMediaKindFromMimeType";
import { getSocialPublishingMaxMediaBytes } from "@/lib/clipstitchr/server/socialPublishing/getSocialPublishingMaxMediaBytes";

export function assertSocialPublishingMediaFile(file: File) {
  if (!getSocialPublishingMediaKindFromMimeType(file.type)) {
    throw new Error("Zernio supports PNG, JPEG, MP4, or MOV media.");
  }

  if (file.size <= 0) {
    throw new Error("Choose media before scheduling.");
  }

  if (file.size > getSocialPublishingMaxMediaBytes()) {
    throw new Error("That media file is too large to schedule.");
  }
}
