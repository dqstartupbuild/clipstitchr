import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";

export function createTextOverlaysComparisonKey(textOverlays: TextOverlay[]) {
  return JSON.stringify(textOverlays);
}
