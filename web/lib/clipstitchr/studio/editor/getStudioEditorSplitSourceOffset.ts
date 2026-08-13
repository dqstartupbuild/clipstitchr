import type { StudioEditorLayer } from "../../types/studioEditor/StudioEditorLayer";

export function getStudioEditorSplitSourceOffset(
  layer: StudioEditorLayer,
  leftDurationSeconds: number,
) {
  if (
    layer.kind === "video" ||
    layer.kind === "voice" ||
    layer.kind === "music"
  ) {
    return (
      layer.sourceOffsetSeconds + leftDurationSeconds * layer.playbackSpeed
    );
  }
  if (layer.kind === "caption" || layer.kind === "text") {
    return layer.sourceOffsetSeconds + leftDurationSeconds;
  }
  return 0;
}
