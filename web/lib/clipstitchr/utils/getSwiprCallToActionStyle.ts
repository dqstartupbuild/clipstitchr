import { defaultSwiprCallToActionStyle } from "@/lib/clipstitchr/constants/defaultSwiprCallToActionStyle";
import { swiprCallToActionStyleOptions } from "@/lib/clipstitchr/constants/swiprCallToActionStyleOptions";
import type { SwiprCallToActionStyle } from "@/lib/clipstitchr/types/SwiprCallToActionStyle";

export function getSwiprCallToActionStyle(
  value: unknown,
): SwiprCallToActionStyle {
  return swiprCallToActionStyleOptions.some((option) => option.id === value)
    ? (value as SwiprCallToActionStyle)
    : defaultSwiprCallToActionStyle;
}
