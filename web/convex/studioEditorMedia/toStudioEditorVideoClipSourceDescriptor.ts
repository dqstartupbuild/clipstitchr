import type { Doc } from "../_generated/dataModel";
import type { StudioEditorMediaSourceDescriptor } from "../../lib/clipstitchr/types/studioEditor/StudioEditorMediaSourceDescriptor";

export function toStudioEditorVideoClipSourceDescriptor(
  clip: Doc<"videoClipCards">,
): StudioEditorMediaSourceDescriptor {
  return {
    kind: "videoClip",
    id: clip.id,
    name: clip.name,
    durationSeconds: clip.duration,
    width: clip.width,
    height: clip.height,
    hasAudio: clip.hasAudio,
    objectKey: clip.videoObject.key,
    ...(clip.posterObject ? { posterKey: clip.posterObject.key } : {}),
  };
}
