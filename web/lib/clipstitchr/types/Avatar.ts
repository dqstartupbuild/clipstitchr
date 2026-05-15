import type { AvatarWardrobeStyle } from "@/lib/clipstitchr/types/AvatarWardrobeStyle";

export type Avatar = {
  id: string;
  name: string;
  description?: string;
  wardrobeStyle: AvatarWardrobeStyle;
  cliprVoiceId: string;
  createdAt: string;
  updatedAt: string;
};
