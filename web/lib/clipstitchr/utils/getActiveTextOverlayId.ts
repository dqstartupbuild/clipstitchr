import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { getTextOverlayId } from "@/lib/clipstitchr/utils/getTextOverlayId";
import { getTextOverlayIndexById } from "@/lib/clipstitchr/utils/getTextOverlayIndexById";

export function getActiveTextOverlayId(
  textOverlays: TextOverlay[],
  activeTextOverlayId: string | null,
) {
  if (getTextOverlayIndexById(textOverlays, activeTextOverlayId) >= 0) {
    return activeTextOverlayId;
  }

  const firstTextOverlay = textOverlays[0];

  return firstTextOverlay ? getTextOverlayId(firstTextOverlay, 0) : null;
}
