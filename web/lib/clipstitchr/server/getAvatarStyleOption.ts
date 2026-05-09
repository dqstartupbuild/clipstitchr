import type { AvatarStyleOption } from "@/lib/clipstitchr/types/AvatarStyleOption";

export function getAvatarStyleOption(value: string): AvatarStyleOption {
  switch (value) {
    case "photo":
    case "candid":
    case "editorial":
    case "travel":
    case "cinematic":
      return value;
    case "selfie":
    default:
      return "selfie";
  }
}
