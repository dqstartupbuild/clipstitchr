import type { StudioEditorCaptionLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorCaptionLayer";

export function getStudioEditorActiveCaptionText(
  layer: StudioEditorCaptionLayer,
  timelineSeconds: number,
) {
  const localSeconds = timelineSeconds - layer.startSeconds;

  return (
    layer.cues.find(
      (cue) =>
        localSeconds >= cue.startSeconds && localSeconds < cue.endSeconds,
    )?.text ?? ""
  );
}
