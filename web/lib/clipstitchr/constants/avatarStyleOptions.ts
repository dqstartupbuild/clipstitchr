import type { AvatarStyleOption } from "@/lib/clipstitchr/types/AvatarStyleOption";

export const avatarStyleOptions: {
  label: string;
  value: AvatarStyleOption;
}[] = [
  { label: "UGC", value: "ugc" },
  { label: "Selfie Style", value: "selfie" },
  { label: "Photo Style", value: "photo" },
  { label: "Candid Style", value: "candid" },
  { label: "Editorial Style", value: "editorial" },
  { label: "Travel Style", value: "travel" },
  { label: "Cinematic Style", value: "cinematic" },
];
