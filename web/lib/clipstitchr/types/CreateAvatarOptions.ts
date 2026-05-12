import type { AvatarWardrobeStyle } from "@/lib/clipstitchr/types/AvatarWardrobeStyle";

export type CreateAvatarOptions = {
  description?: string;
  name: string;
  wardrobeStyle?: AvatarWardrobeStyle;
};
