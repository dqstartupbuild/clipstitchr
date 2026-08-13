import { createDefaultStudioEditorAudioSettings } from "@/lib/clipstitchr/studio/editor/createDefaultStudioEditorAudioSettings";
import { getStudioEditorSafeSourceDuration } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorSafeSourceDuration";
import { getStudioEditorSourceRefFromDescriptor } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorSourceRefFromDescriptor";
import type { StudioEditorMediaSourceDescriptor } from "@/lib/clipstitchr/types/studioEditor/StudioEditorMediaSourceDescriptor";
import type { StudioEditorMusicLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorMusicLayer";
import type { StudioEditorVoiceLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorVoiceLayer";
import { createId } from "@/lib/clipstitchr/utils/createId";

type CreateStudioEditorAudioLayerOptions = {
  descriptor: StudioEditorMediaSourceDescriptor;
  fps: number;
  kind: "music" | "voice";
  startSeconds: number;
};

export function createStudioEditorAudioLayer({
  descriptor,
  fps,
  kind,
  startSeconds,
}: CreateStudioEditorAudioLayerOptions):
  | StudioEditorMusicLayer
  | StudioEditorVoiceLayer {
  return {
    id: createId(),
    kind,
    name: `${descriptor.name} ${kind}`,
    startSeconds,
    durationSeconds: getStudioEditorSafeSourceDuration(
      descriptor.durationSeconds,
      fps,
    ),
    sourceOffsetSeconds: 0,
    source: getStudioEditorSourceRefFromDescriptor(descriptor),
    sourceDurationSeconds: descriptor.durationSeconds,
    playbackSpeed: 1,
    audio: createDefaultStudioEditorAudioSettings(),
  };
}
