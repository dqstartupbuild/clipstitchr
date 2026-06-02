import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { getTextOverlayId } from "@/lib/clipstitchr/utils/getTextOverlayId";

export function getTextOverlayIndexById(
  textOverlays: TextOverlay[],
  textOverlayId: string | null,
) {
  if (!textOverlayId) {
    return -1;
  }

  return textOverlays.findIndex(
    (textOverlay, index) =>
      getTextOverlayId(textOverlay, index) === textOverlayId,
  );
}
