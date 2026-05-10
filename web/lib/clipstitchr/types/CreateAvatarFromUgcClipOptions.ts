import type { AvatarIdentityMode } from "@/lib/clipstitchr/types/AvatarIdentityMode";
import type { AvatarLightingOption } from "@/lib/clipstitchr/types/AvatarLightingOption";
import type { AvatarPhotoGenerationCount } from "@/lib/clipstitchr/types/AvatarPhotoGenerationCount";
import type { AvatarStyleOption } from "@/lib/clipstitchr/types/AvatarStyleOption";

export type CreateAvatarFromUgcClipOptions = {
  avatarDescription: string;
  avatarName: string;
  context: string;
  count: AvatarPhotoGenerationCount;
  identityMode: AvatarIdentityMode;
  lighting: AvatarLightingOption;
  location: string;
  style: AvatarStyleOption;
};
