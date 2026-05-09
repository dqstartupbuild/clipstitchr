import type { AvatarLightingOption } from "@/lib/clipstitchr/types/AvatarLightingOption";

export function getAvatarLightingOption(value: string): AvatarLightingOption {
  switch (value) {
    case "any":
    case "natural":
    case "studio":
    case "golden-hour":
    case "night":
    case "dramatic":
      return value;
    default:
      return "any";
  }
}
