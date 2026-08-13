import { createDefaultStudioEditorAudioSettings } from "@/lib/clipstitchr/studio/editor/createDefaultStudioEditorAudioSettings";
import { createDefaultStudioEditorCrop } from "@/lib/clipstitchr/studio/editor/createDefaultStudioEditorCrop";
import { createDefaultStudioEditorTransform } from "@/lib/clipstitchr/studio/editor/createDefaultStudioEditorTransform";
import { createDefaultStudioEditorTransition } from "@/lib/clipstitchr/studio/editor/createDefaultStudioEditorTransition";
import { getStudioEditorSourceRefFromDescriptor } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorSourceRefFromDescriptor";
import { getStudioEditorSafeSourceDuration } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorSafeSourceDuration";
import type { StudioEditorMediaSourceDescriptor } from "@/lib/clipstitchr/types/studioEditor/StudioEditorMediaSourceDescriptor";
import type { StudioEditorVideoLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorVideoLayer";
import { createId } from "@/lib/clipstitchr/utils/createId";

type CreateStudioEditorVideoLayerOptions = {
  descriptor: StudioEditorMediaSourceDescriptor;
  fps: number;
  layerId?: string;
  startSeconds: number;
};

export function createStudioEditorVideoLayer({
  descriptor,
  fps,
  layerId,
  startSeconds,
}: CreateStudioEditorVideoLayerOptions): StudioEditorVideoLayer {
  return {
    id: layerId ?? createId(),
    kind: "video",
    name: descriptor.name,
    startSeconds,
    durationSeconds: getStudioEditorSafeSourceDuration(
      descriptor.durationSeconds,
      fps,
    ),
    sourceOffsetSeconds: 0,
    source: getStudioEditorSourceRefFromDescriptor(descriptor),
    sourceDurationSeconds: descriptor.durationSeconds,
    playbackSpeed: 1,
    transform: createDefaultStudioEditorTransform(),
    crop: createDefaultStudioEditorCrop(),
    audio: createDefaultStudioEditorAudioSettings(),
    transitionIn: createDefaultStudioEditorTransition(),
  };
}
