import type { AvatarGenerationVariant } from "@/lib/clipstitchr/types/AvatarGenerationVariant";

export type GeneratedAvatarPhoto = {
  dataUrl: string;
  mimeType: string;
  variant: AvatarGenerationVariant;
};
