import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { getTextOverlayStyle } from "@/lib/clipstitchr/utils/getTextOverlayStyle";

export function getTextOverlayColor(textOverlay: TextOverlay) {
  return textOverlay.color ?? getTextOverlayStyle(textOverlay.styleId).color;
}
