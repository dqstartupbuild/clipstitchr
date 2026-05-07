import type { TextOverlay } from "@/lib/clipr/types/TextOverlay";
import { clampTextOverlay } from "@/lib/clipr/utils/clampTextOverlay";
import { clamp } from "@/lib/clipr/utils/clamp";

export function createDefaultTextOverlay(
  totalDuration: number,
  currentTime: number,
): TextOverlay {
  const safeDuration = Math.max(0, totalDuration);
  const startTime = clamp(currentTime, 0, Math.max(0, safeDuration - 0.25));
  const endTime = Math.min(safeDuration, startTime + 3);

  return clampTextOverlay(
    {
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
