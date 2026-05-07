import type { TextOverlay } from "@/lib/clipr/types/TextOverlay";
import { applyCssColorAlpha } from "@/lib/clipr/utils/applyCssColorAlpha";
import { getCssColorAlpha } from "@/lib/clipr/utils/getCssColorAlpha";
import { getTextOverlayStyle } from "@/lib/clipr/utils/getTextOverlayStyle";

export function getTextOverlayBackgroundColor(textOverlay: TextOverlay) {
  const styleBackgroundColor =
    getTextOverlayStyle(textOverlay.styleId).backgroundColor;

  if (!styleBackgroundColor) {
    return undefined;
  }

  if (!textOverlay.backgroundColor) {
    return styleBackgroundColor;
  }

  return applyCssColorAlpha(
    textOverlay.backgroundColor,
    getCssColorAlpha(styleBackgroundColor),
  );
}
