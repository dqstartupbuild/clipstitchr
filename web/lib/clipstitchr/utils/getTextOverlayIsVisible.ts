import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { getTextOverlayIsInRange } from "@/lib/clipstitchr/utils/getTextOverlayIsInRange";

export function getTextOverlayIsVisible(
  textOverlay: TextOverlay,
  currentTime: number,
) {
  return (
    textOverlay.text.trim().length > 0 &&
    getTextOverlayIsInRange(textOverlay, currentTime)
  );
}
