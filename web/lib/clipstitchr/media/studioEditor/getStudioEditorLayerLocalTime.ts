import type { StudioEditorLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorLayer";

export function getStudioEditorLayerLocalTime(
  layer: StudioEditorLayer,
  timelineSeconds: number,
) {
  return Math.max(
    0,
    Math.min(layer.durationSeconds, timelineSeconds - layer.startSeconds),
  );
}
