import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";

export function cloneTextOverlays(textOverlays: TextOverlay[]) {
  return textOverlays.map((textOverlay) => ({ ...textOverlay }));
}
