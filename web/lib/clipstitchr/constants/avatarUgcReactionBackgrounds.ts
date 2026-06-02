import type { AvatarScenarioCategory } from "@/lib/clipstitchr/types/AvatarScenarioCategory";

export const avatarUgcReactionBackgrounds: {
  categories: AvatarScenarioCategory[];
  description: string;
}[] = [
  {
    categories: ["home"],
    description:
      "a close, softly blurred apartment room background directly behind the creator",
  },
  {
    categories: ["home"],
    description:
      "a nearby bedroom wall and doorway background, casual and out of focus",
  },
  {
    categories: ["home", "food"],
    description:
      "a close kitchen background with counters barely visible behind the creator",
  },
  {
    categories: ["home", "work"],
    description:
      "a desk or home office background seen only as soft context behind the face",
  },
  {
    categories: ["transit"],
    description:
      "the inside of a parked car visible only as a tight background behind the creator",
  },
  {
    categories: ["outdoor"],
    description:
      "a simple outdoor wall or window-light background, close and softly blurred",
  },
  {
    categories: ["beauty", "home"],
    description:
      "a bathroom or getting-ready-room background, close behind the creator and out of focus",
  },
  {
    categories: ["home"],
    description:
      "a neutral hallway or closet background, cropped tightly behind the creator",
  },
];
