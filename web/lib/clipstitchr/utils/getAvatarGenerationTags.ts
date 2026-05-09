import { getAvatarLightingPrompt } from "@/lib/clipstitchr/utils/getAvatarLightingPrompt";
import type { AvatarLightingOption } from "@/lib/clipstitchr/types/AvatarLightingOption";
import type { AvatarStyleOption } from "@/lib/clipstitchr/types/AvatarStyleOption";
import { normalizeAssetTagsWithRequiredTag } from "@/lib/clipstitchr/utils/normalizeAssetTagsWithRequiredTag";
import { getAvatarStylePrompt } from "@/lib/clipstitchr/utils/getAvatarStylePrompt";

export function getAvatarGenerationTags({
  lighting,
  location,
  style,
}: {
  lighting: AvatarLightingOption;
  location: string;
  style: AvatarStyleOption;
}) {
  return normalizeAssetTagsWithRequiredTag(
    [
      "avatar",
      "generated",
      location.trim(),
      getAvatarLightingPrompt(lighting),
      getAvatarStylePrompt(style),
    ],
    "photo",
  );
}
