import {
  avatarGenerationLocationOptions,
  getAvatarGenerationLocationCategories,
} from "@/lib/clipstitchr/constants/avatarGenerationLocations";
import { getAvatarGenerationOutfits } from "@/lib/clipstitchr/constants/avatarGenerationOutfits";
import { getAvatarGenerationPosesForLocationCategories } from "@/lib/clipstitchr/constants/avatarGenerationPoses";
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
  outfit,
  style,
  wardrobeStyle = "any",
}: {
  context: string;
  count: AvatarPhotoGenerationCount;
  lighting: AvatarLightingOption;
  location: string;
  outfit?: string;
  style: AvatarStyleOption;
  wardrobeStyle?: AvatarWardrobeStyle;
}): AvatarGenerationVariant[] {
  const outfits = getShuffledItems(getAvatarGenerationOutfits(wardrobeStyle));
  const locations = getShuffledItems(avatarGenerationLocationOptions);
  const trimmedContext = context.trim();
  const trimmedLocation = location.trim();
  const trimmedOutfit = outfit?.trim();
  const contextualOutfit =
    trimmedOutfit ||
    createContextualOutfitDescription({
      context: trimmedContext,
      location: trimmedLocation,
      wardrobeStyle,
    });

  return Array.from({ length: count }, (_, index) => {
    const locationOption = trimmedLocation
      ? {
          categories: getAvatarGenerationLocationCategories(trimmedLocation),
          description: trimmedLocation,
        }
      : locations[index % locations.length];
    const poses = getShuffledItems(
      getAvatarGenerationPosesForLocationCategories(locationOption.categories),
    );

    return {
      outfitDescription: contextualOutfit || outfits[index % outfits.length],
      locationDescription: locationOption.description,
      poseDescription: trimmedContext || poses[index % poses.length],
      lighting:
        lighting === "any" ? getRandomItem(randomLightingOptions) : lighting,
      style,
    };
  });
}

function createContextualOutfitDescription({
  context,
  location,
  wardrobeStyle,
}: {
  context: string;
  location: string;
  wardrobeStyle: AvatarWardrobeStyle;
}) {
  if (!context && !location) {
    return "";
  }

  const scene = [
    location ? `location: ${location}` : "",
    context ? `pose/action: ${context}` : "",
  ]
    .filter(Boolean)
    .join("; ");
  const wardrobeFit =
    wardrobeStyle === "male"
      ? "with masculine or neutral styling"
      : wardrobeStyle === "female"
        ? "with feminine or neutral styling"
        : "with styling that fits the avatar";

  return [
    `context-appropriate clothing for ${scene}`,
    wardrobeFit,
    "practical and believable for the activity and setting",
    "use athletic/workout clothing for gym or fitness scenes",
    "avoid formal, office, streetwear, or fashion outfits when they do not fit the activity",
  ].join("; ");
}
