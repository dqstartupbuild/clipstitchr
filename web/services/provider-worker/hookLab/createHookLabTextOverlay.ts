import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";

export function createHookLabTextOverlay(
  text: string,
  duration: number,
  recipeOverlay?: TextOverlay,
): TextOverlay {
  return {
    ...(recipeOverlay ?? {
      fontSize: 0.052,
      styleId: "hook" as const,
      width: 0.76,
      x: 0.12,
      y: 0.18,
    }),
    text: text.trim(),
    startTime: 0,
    endTime: Math.max(1, duration),
  };
}
