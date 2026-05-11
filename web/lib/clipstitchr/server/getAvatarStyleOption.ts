import { DEFAULT_AVATAR_STYLE_OPTION } from "@/lib/clipstitchr/constants/defaultAvatarStyleOption";
import type { AvatarStyleOption } from "@/lib/clipstitchr/types/AvatarStyleOption";

export function getAvatarStyleOption(value: string): AvatarStyleOption {
  switch (value) {
    case "ugc":
    case "photo":
    case "candid":
    case "editorial":
    case "travel":
    case "cinematic":
      return value;
    case "selfie":
      return "selfie";
    default:
      return DEFAULT_AVATAR_STYLE_OPTION;
  }
}
