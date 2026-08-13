import type { StudioEditorLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorLayer";

export function updateStudioEditorLayerTiming(
  layer: StudioEditorLayer,
  change: Partial<{
    durationSeconds: number;
    sourceOffsetSeconds: number;
    startSeconds: number;
  }>,
  onTrim: (values: {
    durationSeconds: number;
    sourceOffsetSeconds: number;
    startSeconds: number;
  }) => void,
) {
  onTrim({
    durationSeconds: layer.durationSeconds,
    sourceOffsetSeconds: layer.sourceOffsetSeconds,
    startSeconds: layer.startSeconds,
    ...change,
  });
}
