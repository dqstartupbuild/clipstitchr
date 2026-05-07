import { TEXT_OVERLAY_STYLES } from "@/lib/clipr/constants/textOverlayStyles";
import type { TextOverlayStyle } from "@/lib/clipr/types/TextOverlayStyle";
import type { TextOverlayStyleId } from "@/lib/clipr/types/TextOverlayStyleId";

export function getTextOverlayStyle(
  styleId: TextOverlayStyleId,
): TextOverlayStyle {
  return (
    TEXT_OVERLAY_STYLES.find((style) => style.id === styleId) ??
    TEXT_OVERLAY_STYLES[0]
  );
}
