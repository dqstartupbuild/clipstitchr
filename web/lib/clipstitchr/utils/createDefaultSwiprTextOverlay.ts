import { SWIPR_STATIC_DURATION } from "@/lib/clipstitchr/constants/swiprStaticDuration";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { clampTextOverlay } from "@/lib/clipstitchr/utils/clampTextOverlay";

export function createDefaultSwiprTextOverlay(slideNumber: number): TextOverlay {
  return clampTextOverlay(
    {
      text: `Slide ${slideNumber} hook`,
      startTime: 0,
      endTime: SWIPR_STATIC_DURATION,
      x: 0.12,
      y: slideNumber % 2 === 0 ? 0.58 : 0.18,
      width: 0.76,
      fontSize: 0.052,
      styleId: slideNumber % 3 === 0 ? "caption" : "hook",
    },
    SWIPR_STATIC_DURATION,
  );
}
