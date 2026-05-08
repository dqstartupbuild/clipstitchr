import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { applyCssColorAlpha } from "@/lib/clipstitchr/utils/applyCssColorAlpha";
import { getCssColorAlpha } from "@/lib/clipstitchr/utils/getCssColorAlpha";
import { getTextOverlayStyle } from "@/lib/clipstitchr/utils/getTextOverlayStyle";

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
