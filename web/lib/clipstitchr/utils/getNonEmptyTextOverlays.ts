import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";

export function getNonEmptyTextOverlays(textOverlays: TextOverlay[]) {
  return textOverlays.filter(
    (textOverlay) => textOverlay.text.trim().length > 0,
  );
}
