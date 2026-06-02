import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { getTextOverlayId } from "@/lib/clipstitchr/utils/getTextOverlayId";

export function replaceTextOverlayById(
  textOverlays: TextOverlay[],
  textOverlayId: string,
  nextTextOverlay: TextOverlay,
) {
  return textOverlays.map((textOverlay, index) =>
    getTextOverlayId(textOverlay, index) === textOverlayId
      ? nextTextOverlay
      : textOverlay,
  );
}
