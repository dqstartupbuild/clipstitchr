import type { TextOverlay } from "@/lib/clipr/types/TextOverlay";
import { getTextOverlayStyle } from "@/lib/clipr/utils/getTextOverlayStyle";

export function getTextOverlayColor(textOverlay: TextOverlay) {
  return textOverlay.color ?? getTextOverlayStyle(textOverlay.styleId).color;
}
