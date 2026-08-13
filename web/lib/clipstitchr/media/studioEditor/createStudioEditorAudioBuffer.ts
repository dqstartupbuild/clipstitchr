import {
  OUTPUT_AUDIO_NUMBER_OF_CHANNELS,
  OUTPUT_AUDIO_SAMPLE_RATE,
} from "@/lib/clipstitchr/constants/audioOutputParameters";
import { getStudioEditorActiveScene } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorActiveScene";
import { scheduleStudioEditorLayerAudio } from "@/lib/clipstitchr/media/studioEditor/scheduleStudioEditorLayerAudio";
import type { StudioEditorRenderResource } from "@/lib/clipstitchr/types/StudioEditorRenderResource";
import type { StudioEditorProjectV1 } from "@/lib/clipstitchr/types/studioEditor/StudioEditorProjectV1";

type CreateStudioEditorAudioBufferOptions = {
  outputDuration: number;
  project: StudioEditorProjectV1;
  resources: Map<string, StudioEditorRenderResource>;
};

export async function createStudioEditorAudioBuffer({
  outputDuration,
  project,
  resources,
}: CreateStudioEditorAudioBufferOptions) {
  const context = new OfflineAudioContext(
    OUTPUT_AUDIO_NUMBER_OF_CHANNELS,
    Math.max(1, Math.ceil(outputDuration * OUTPUT_AUDIO_SAMPLE_RATE)),
    OUTPUT_AUDIO_SAMPLE_RATE,
  );
  let scheduled = false;

  for (const track of getStudioEditorActiveScene(project).tracks) {
    if (track.hidden || track.muted) {
      continue;
    }

    for (const layer of track.layers) {
      if (
        layer.kind !== "video" &&
        layer.kind !== "voice" &&
        layer.kind !== "music"
      ) {
        continue;
      }

      scheduled =
        (await scheduleStudioEditorLayerAudio({
          context,
          layer,
          outputDuration,
          resources,
        })) || scheduled;
    }
  }

  return scheduled ? await context.startRendering() : null;
}
