import { TEXT_OVERLAY_STYLES } from "@/lib/clipstitchr/constants/textOverlayStyles";
import type { TextOverlayStyle } from "@/lib/clipstitchr/types/TextOverlayStyle";
import type { TextOverlayStyleId } from "@/lib/clipstitchr/types/TextOverlayStyleId";

export function getTextOverlayStyle(
  styleId: TextOverlayStyleId,
): TextOverlayStyle {
  return (
    TEXT_OVERLAY_STYLES.find((style) => style.id === styleId) ??
    TEXT_OVERLAY_STYLES[0]
  );
}
