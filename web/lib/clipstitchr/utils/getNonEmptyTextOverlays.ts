import type { TextOverlay } from "../types/TextOverlay";

export function getNonEmptyTextOverlays(textOverlays: TextOverlay[]) {
  return textOverlays.filter(
    (textOverlay) => textOverlay.text.trim().length > 0,
  );
}
