import type { Doc } from "../_generated/dataModel";

export function getHookLabOriginalTextFromStitch(
  stitch: Doc<"stitches">,
) {
  return (
    stitch.textOverlays?.find((overlay) => overlay.text.trim())?.text.trim() ??
    stitch.textOverlay?.text.trim() ??
    undefined
  );
}
