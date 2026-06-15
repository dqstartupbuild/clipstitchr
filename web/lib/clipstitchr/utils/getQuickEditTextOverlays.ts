import type { QuickEditOverlayText } from "@/lib/clipstitchr/types/QuickEditOverlayText";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { clampTextOverlays } from "@/lib/clipstitchr/utils/clampTextOverlays";
import { createDefaultTextOverlay } from "@/lib/clipstitchr/utils/createDefaultTextOverlay";
import { getNonEmptyTextOverlays } from "@/lib/clipstitchr/utils/getNonEmptyTextOverlays";
import { getTextOverlayList } from "@/lib/clipstitchr/utils/getTextOverlayList";

type GetQuickEditTextOverlaysOptions = {
  duration: number;
  overlayText?: QuickEditOverlayText;
  textOverlay?: TextOverlay | null;
  textOverlays?: TextOverlay[] | null;
};

export function getQuickEditTextOverlays({
  duration,
  overlayText,
  textOverlay,
  textOverlays,
}: GetQuickEditTextOverlaysOptions) {
  const currentTextOverlays = getTextOverlayList(textOverlays, textOverlay);

  if (!overlayText?.replaceWith.trim()) {
    return getNonEmptyTextOverlays(
      clampTextOverlays(currentTextOverlays, duration),
    );
  }

  const replacementText = overlayText.replaceWith.trim();
  const nextTextOverlays = currentTextOverlays.length
    ? currentTextOverlays.map((item, index) =>
        index === 0 ? { ...item, text: replacementText } : item,
      )
    : [{ ...createDefaultTextOverlay(duration, 0), text: replacementText }];

  return getNonEmptyTextOverlays(
    clampTextOverlays(nextTextOverlays, duration),
  );
}
