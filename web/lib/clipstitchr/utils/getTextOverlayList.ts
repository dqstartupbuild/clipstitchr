import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";

export function getTextOverlayList(
  textOverlays?: TextOverlay[] | null,
  textOverlay?: TextOverlay | null,
) {
  if (textOverlays?.length) {
    return textOverlays;
  }

  return textOverlay ? [textOverlay] : [];
}
