import type { AvatarWardrobeStyle } from "@/lib/clipstitchr/types/AvatarWardrobeStyle";

export type CreateAvatarOptions = {
  cliprVoiceId?: string;
  description?: string;
  name: string;
  wardrobeStyle?: AvatarWardrobeStyle;
};
