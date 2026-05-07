import type { TextOverlay } from "@/lib/clipr/types/TextOverlay";
import { getTextOverlayStyle } from "@/lib/clipr/utils/getTextOverlayStyle";

export function getTextOverlayStrokeColor(textOverlay: TextOverlay) {
  const styleStrokeColor = getTextOverlayStyle(textOverlay.styleId).strokeColor;

  if (!styleStrokeColor) {
    return undefined;
  }

  return textOverlay.strokeColor ?? styleStrokeColor;
}
