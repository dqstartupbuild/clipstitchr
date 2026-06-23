import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";
import { createDefaultTextOverlay } from "@/lib/clipstitchr/utils/createDefaultTextOverlay";

export function getTextOverlaysWithSelectedHook({
  hookText,
  textOverlays,
  totalDuration,
}: {
  hookText: string;
  textOverlays: TextOverlay[];
  totalDuration: number;
}) {
  const baseOverlay =
    textOverlays[0] ?? createDefaultTextOverlay(totalDuration, 0);

  return [
    {
      ...baseOverlay,
      text: hookText,
    },
    ...textOverlays.slice(1),
  ];
}
