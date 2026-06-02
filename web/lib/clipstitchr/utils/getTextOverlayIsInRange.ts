import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";

export function getTextOverlayIsInRange(
  textOverlay: TextOverlay,
  currentTime: number,
) {
  return (
    currentTime >= textOverlay.startTime && currentTime <= textOverlay.endTime
  );
}
