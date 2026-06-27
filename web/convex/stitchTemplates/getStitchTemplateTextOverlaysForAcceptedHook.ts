import type { Doc } from "../_generated/dataModel";
import type { TextOverlay } from "../../lib/clipstitchr/types/TextOverlay";

export function getStitchTemplateTextOverlaysForAcceptedHook({
  hookText,
  stitch,
}: {
  hookText: string;
  stitch: Doc<"stitches">;
}) {
  const textOverlays = stitch.textOverlays?.length
    ? stitch.textOverlays
    : stitch.textOverlay
      ? [stitch.textOverlay]
      : [];
  const baseOverlay: TextOverlay = textOverlays[0] ?? {
    endTime: Math.min(Math.max(stitch.duration, 0), 3),
    fontSize: 0.045,
    id: `${stitch.id}:winner-hook`,
    startTime: 0,
    styleId: "clean",
    text: hookText,
    width: 0.68,
    x: 0.16,
    y: 0.36,
  };

  return [
    {
      ...baseOverlay,
      text: hookText,
    },
    ...textOverlays.slice(1),
  ];
}
