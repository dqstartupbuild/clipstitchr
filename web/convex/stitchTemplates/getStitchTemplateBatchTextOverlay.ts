import type { Doc } from "../_generated/dataModel";
import { getNonEmptyTextOverlays } from "../../lib/clipstitchr/utils/getNonEmptyTextOverlays";
import { getTextOverlayList } from "../../lib/clipstitchr/utils/getTextOverlayList";

export function getStitchTemplateBatchTextOverlay(
  template: Doc<"stitchTemplates">,
) {
  return getNonEmptyTextOverlays(
    getTextOverlayList(template.textOverlays, template.textOverlay),
  )[0];
}
