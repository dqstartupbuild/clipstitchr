import type { AvatarWardrobeStyle } from "@/lib/clipstitchr/types/AvatarWardrobeStyle";

export function getAvatarWardrobeStyle(value: string): AvatarWardrobeStyle {
  if (value === "male" || value === "female") {
    return value;
  }

  return "any";
}
