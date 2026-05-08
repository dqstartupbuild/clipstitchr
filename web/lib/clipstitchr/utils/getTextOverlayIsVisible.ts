import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";

export function getTextOverlayIsVisible(
  textOverlay: TextOverlay,
  currentTime: number,
) {
  return (
    textOverlay.text.trim().length > 0 &&
    currentTime >= textOverlay.startTime &&
    currentTime <= textOverlay.endTime
  );
}
