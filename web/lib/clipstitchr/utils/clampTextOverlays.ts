import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { clampTextOverlay } from "@/lib/clipstitchr/utils/clampTextOverlay";

export function clampTextOverlays(
  textOverlays: TextOverlay[],
  totalDuration: number,
) {
  return textOverlays.map((textOverlay) =>
    clampTextOverlay(textOverlay, totalDuration),
  );
}
