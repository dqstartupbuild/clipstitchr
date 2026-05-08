import {
  TEXT_OVERLAY_MAX_FONT_SIZE,
  TEXT_OVERLAY_MAX_WIDTH,
  TEXT_OVERLAY_MIN_DURATION,
  TEXT_OVERLAY_MIN_FONT_SIZE,
  TEXT_OVERLAY_MIN_WIDTH,
} from "@/lib/clipstitchr/constants/textOverlayBounds";
import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { clamp } from "@/lib/clipstitchr/utils/clamp";

export function clampTextOverlay(
  textOverlay: TextOverlay,
  totalDuration: number,
): TextOverlay {
  const safeDuration = Math.max(0, totalDuration);
  const width = clamp(
    textOverlay.width,
    TEXT_OVERLAY_MIN_WIDTH,
    TEXT_OVERLAY_MAX_WIDTH,
  );
  const fontSize = clamp(
    textOverlay.fontSize,
    TEXT_OVERLAY_MIN_FONT_SIZE,
    TEXT_OVERLAY_MAX_FONT_SIZE,
  );

  if (safeDuration <= TEXT_OVERLAY_MIN_DURATION) {
    return {
      ...textOverlay,
      startTime: 0,
      endTime: safeDuration,
      x: clamp(textOverlay.x, 0, 1 - width),
      y: clamp(textOverlay.y, 0, 0.9),
      width,
      fontSize,
    };
  }

  const startTime = clamp(
    textOverlay.startTime,
    0,
    safeDuration - TEXT_OVERLAY_MIN_DURATION,
  );
  const endTime = clamp(
    textOverlay.endTime,
    startTime + TEXT_OVERLAY_MIN_DURATION,
    safeDuration,
  );

  return {
    ...textOverlay,
    startTime,
    endTime,
    x: clamp(textOverlay.x, 0, 1 - width),
    y: clamp(textOverlay.y, 0, 0.9),
    width,
    fontSize,
  };
}
