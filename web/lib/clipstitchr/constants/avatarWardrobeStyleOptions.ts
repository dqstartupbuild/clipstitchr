import type { AvatarWardrobeStyle } from "@/lib/clipstitchr/types/AvatarWardrobeStyle";

export const avatarWardrobeStyleOptions: {
  label: string;
  value: AvatarWardrobeStyle;
}[] = [
  { label: "All outfits", value: "any" },
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];
