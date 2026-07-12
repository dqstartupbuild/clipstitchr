import type { TextOverlay } from "../../lib/clipstitchr/types/TextOverlay";
import { getNonEmptyTextOverlays } from "../../lib/clipstitchr/utils/getNonEmptyTextOverlays";
import { getTextOverlayList } from "../../lib/clipstitchr/utils/getTextOverlayList";

export function getStitchTemplateBatchTextOverlay(
  template: {
    textOverlay?: TextOverlay;
    textOverlays?: TextOverlay[];
  },
) {
  return getNonEmptyTextOverlays(
    getTextOverlayList(template.textOverlays, template.textOverlay),
  )[0];
}
