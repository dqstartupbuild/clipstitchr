import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";

export function createStitchrTemplateTextOverlay(
  textOverlay: TextOverlay,
  duration: number,
): TextOverlay {
  return {
    ...textOverlay,
    text: textOverlay.text.trim(),
    startTime: 0,
    endTime: Math.max(1, duration),
  };
}
