import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";

export function getTextOverlayId(textOverlay: TextOverlay, index: number) {
  return textOverlay.id ?? `text-overlay-${index}`;
}
