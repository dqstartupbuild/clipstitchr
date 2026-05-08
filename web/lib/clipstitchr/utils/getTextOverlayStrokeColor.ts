import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { getTextOverlayStyle } from "@/lib/clipstitchr/utils/getTextOverlayStyle";

export function getTextOverlayStrokeColor(textOverlay: TextOverlay) {
  const styleStrokeColor = getTextOverlayStyle(textOverlay.styleId).strokeColor;

  if (!styleStrokeColor) {
    return undefined;
  }

  return textOverlay.strokeColor ?? styleStrokeColor;
}
