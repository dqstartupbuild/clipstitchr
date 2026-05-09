import type { AvatarLightingOption } from "@/lib/clipstitchr/types/AvatarLightingOption";

export const avatarLightingOptions: {
  label: string;
  value: AvatarLightingOption;
}[] = [
  { label: "Any", value: "any" },
  { label: "Natural", value: "natural" },
  { label: "Studio", value: "studio" },
  { label: "Golden Hour", value: "golden-hour" },
  { label: "Night", value: "night" },
  { label: "Dramatic", value: "dramatic" },
];
