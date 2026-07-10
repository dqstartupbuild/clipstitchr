import { defaultSwiprCallToActionStyle } from "../constants/defaultSwiprCallToActionStyle";
import { swiprCallToActionStyleOptions } from "../constants/swiprCallToActionStyleOptions";
import type { SwiprCallToActionStyle } from "../types/SwiprCallToActionStyle";

export function getSwiprCallToActionStyle(
  value: unknown,
): SwiprCallToActionStyle {
  return swiprCallToActionStyleOptions.some((option) => option.id === value)
    ? (value as SwiprCallToActionStyle)
    : defaultSwiprCallToActionStyle;
}
