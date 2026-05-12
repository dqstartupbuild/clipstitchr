import type { AvatarWardrobeStyle } from "@/lib/clipstitchr/types/AvatarWardrobeStyle";

export type Avatar = {
  id: string;
  name: string;
  description?: string;
  wardrobeStyle: AvatarWardrobeStyle;
  createdAt: string;
  updatedAt: string;
};
