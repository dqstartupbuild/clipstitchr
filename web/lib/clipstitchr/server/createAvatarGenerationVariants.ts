import {
  avatarGenerationLocationOptions,
  getAvatarGenerationLocationCategories,
} from "@/lib/clipstitchr/constants/avatarGenerationLocations";
import { getAvatarGenerationOutfits } from "@/lib/clipstitchr/constants/avatarGenerationOutfits";
import { getAvatarGenerationPosesForLocationCategories } from "@/lib/clipstitchr/constants/avatarGenerationPoses";
import { avatarUgcReactionBackgrounds } from "@/lib/clipstitchr/constants/avatarUgcReactionBackgrounds";
import { avatarUgcReactionPoseActions } from "@/lib/clipstitchr/constants/avatarUgcReactionPoseActions";
import { avatarUgcVisibleOutfitOptions } from "@/lib/clipstitchr/constants/avatarUgcVisibleOutfitOptions";
import type {
  AvatarGenerationResolvedLighting,
  AvatarGenerationVariant,
} from "@/lib/clipstitchr/types/AvatarGenerationVariant";
import type { AvatarLightingOption } from "@/lib/clipstitchr/types/AvatarLightingOption";
import type { AvatarPhotoGenerationCount } from "@/lib/clipstitchr/types/AvatarPhotoGenerationCount";
import type { AvatarStyleOption } from "@/lib/clipstitchr/types/AvatarStyleOption";
import type { AvatarWardrobeStyle } from "@/lib/clipstitchr/types/AvatarWardrobeStyle";

const randomLightingOptions: AvatarGenerationResolvedLighting[] = [
  "natural",
  "studio",
  "golden-hour",
  "night",
  "dramatic",
];

function getShuffledItems<T>(items: readonly T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function getRandomItem<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)] as T;
}

export function createAvatarGenerationVariants({
  context,
  count,
  lighting,
  location,
  style,
  wardrobeStyle = "any",
}: {
  context: string;
  count: AvatarPhotoGenerationCount;
  lighting: AvatarLightingOption;
  location: string;
  style: AvatarStyleOption;
  wardrobeStyle?: AvatarWardrobeStyle;
}): AvatarGenerationVariant[] {
  const isUgcStyle = style === "ugc";
  const outfits = getShuffledItems(
    isUgcStyle
      ? avatarUgcVisibleOutfitOptions
      : getAvatarGenerationOutfits(wardrobeStyle),
  );
  const locations = getShuffledItems(
    isUgcStyle ? avatarUgcReactionBackgrounds : avatarGenerationLocationOptions,
  );
  const trimmedContext = context.trim();
  const trimmedLocation = location.trim();

  return Array.from({ length: count }, (_, index) => {
    const locationOption = trimmedLocation
      ? {
          categories: getAvatarGenerationLocationCategories(trimmedLocation),
          description: isUgcStyle
            ? `${trimmedLocation}, visible only as a close, softly blurred background behind the creator`
            : trimmedLocation,
        }
      : locations[index % locations.length];
    const poses = getShuffledItems(
      isUgcStyle
        ? avatarUgcReactionPoseActions
        : getAvatarGenerationPosesForLocationCategories(
            locationOption.categories,
          ),
    );

    return {
      outfitDescription: outfits[index % outfits.length],
      locationDescription: locationOption.description,
      poseDescription: trimmedContext || poses[index % poses.length],
      lighting:
        lighting === "any" ? getRandomItem(randomLightingOptions) : lighting,
      style,
    };
  });
}
