import type { StudioEditorLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorLayer";

export function getStudioEditorLayerIsActive(
  layer: StudioEditorLayer,
  timelineSeconds: number,
) {
  return (
    timelineSeconds >= layer.startSeconds &&
    timelineSeconds < layer.startSeconds + layer.durationSeconds
  );
}
