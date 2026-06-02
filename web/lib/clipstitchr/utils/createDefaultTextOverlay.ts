import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { clampTextOverlay } from "@/lib/clipstitchr/utils/clampTextOverlay";
import { clamp } from "@/lib/clipstitchr/utils/clamp";
import { createId } from "@/lib/clipstitchr/utils/createId";

export function createDefaultTextOverlay(
  totalDuration: number,
  currentTime: number,
): TextOverlay {
  const safeDuration = Math.max(0, totalDuration);
  const startTime = clamp(currentTime, 0, Math.max(0, safeDuration - 0.25));
  const endTime = Math.min(safeDuration, startTime + 3);

  return clampTextOverlay(
    {
      id: createId(),
      text: "Your text here",
      startTime,
      endTime,
      x: 0.16,
      y: 0.36,
      width: 0.68,
      fontSize: 0.045,
      styleId: "clean",
    },
    safeDuration,
  );
}
