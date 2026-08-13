import type { StudioEditorImageLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorImageLayer";
import type { StudioEditorTextLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorTextLayer";
import type { StudioEditorVideoLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorVideoLayer";
import { getStudioEditorLayerLocalTime } from "./getStudioEditorLayerLocalTime";

export function getStudioEditorTransitionProgress(
  layer: StudioEditorVideoLayer | StudioEditorImageLayer | StudioEditorTextLayer,
  timelineSeconds: number,
) {
  if (
    layer.transitionIn.kind === "none" ||
    layer.transitionIn.durationSeconds <= 0
  ) {
    return 1;
  }

  return Math.max(
    0,
    Math.min(
      1,
      getStudioEditorLayerLocalTime(layer, timelineSeconds) /
        layer.transitionIn.durationSeconds,
    ),
  );
}
