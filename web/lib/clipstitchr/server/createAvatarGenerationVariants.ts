import { avatarGenerationLocations } from "@/lib/clipstitchr/constants/avatarGenerationLocations";
import { avatarGenerationOutfits } from "@/lib/clipstitchr/constants/avatarGenerationOutfits";
import type {
  AvatarGenerationResolvedLighting,
  AvatarGenerationVariant,
} from "@/lib/clipstitchr/types/AvatarGenerationVariant";
import type { AvatarLightingOption } from "@/lib/clipstitchr/types/AvatarLightingOption";
import type { AvatarPhotoGenerationCount } from "@/lib/clipstitchr/types/AvatarPhotoGenerationCount";
import type { AvatarStyleOption } from "@/lib/clipstitchr/types/AvatarStyleOption";

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
}: {
  context: string;
  count: AvatarPhotoGenerationCount;
  lighting: AvatarLightingOption;
  location: string;
  style: AvatarStyleOption;
}): AvatarGenerationVariant[] {
  const outfits = getShuffledItems(avatarGenerationOutfits);
  const locations = getShuffledItems(avatarGenerationLocations);
  const trimmedContext = context.trim();
  const trimmedLocation = location.trim();

  return Array.from({ length: count }, (_, index) => ({
    ...(trimmedContext ? { contextDescription: trimmedContext } : {}),
    outfitDescription: outfits[index % outfits.length],
    locationDescription: trimmedLocation || locations[index % locations.length],
    lighting:
      lighting === "any" ? getRandomItem(randomLightingOptions) : lighting,
    style,
  }));
}
