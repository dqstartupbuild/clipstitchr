import type { AvatarLightingOption } from "@/lib/clipstitchr/types/AvatarLightingOption";
import type { AvatarStyleOption } from "@/lib/clipstitchr/types/AvatarStyleOption";

export type AvatarGenerationResolvedLighting = Exclude<
  AvatarLightingOption,
  "any"
>;

export type AvatarGenerationVariant = {
  outfitDescription: string;
  locationDescription: string;
  poseDescription: string;
  lighting: AvatarGenerationResolvedLighting;
  style: AvatarStyleOption;
};
