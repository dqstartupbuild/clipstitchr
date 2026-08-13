import { AudioBufferSink } from "mediabunny";
import { getStudioEditorAudioGain } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorAudioGain";
import { getStudioEditorSourceIdentity } from "@/lib/clipstitchr/media/studioEditor/getStudioEditorSourceIdentity";
import type { StudioEditorRenderResource } from "@/lib/clipstitchr/types/StudioEditorRenderResource";
import type { StudioEditorMusicLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorMusicLayer";
import type { StudioEditorVideoLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorVideoLayer";
import type { StudioEditorVoiceLayer } from "@/lib/clipstitchr/types/studioEditor/StudioEditorVoiceLayer";

type ScheduleStudioEditorLayerAudioOptions = {
  context: OfflineAudioContext;
  layer: StudioEditorVideoLayer | StudioEditorVoiceLayer | StudioEditorMusicLayer;
  outputDuration: number;
  resources: Map<string, StudioEditorRenderResource>;
};

export async function scheduleStudioEditorLayerAudio({
  context,
  layer,
  outputDuration,
  resources,
}: ScheduleStudioEditorLayerAudioOptions) {
  if (layer.audio.muted || layer.audio.volume <= 0) {
    return false;
  }

  const resource = resources.get(getStudioEditorSourceIdentity(layer.source));
  const audioTrack = await resource?.input?.getPrimaryAudioTrack();

  if (!audioTrack) {
    return false;
  }

  const sink = new AudioBufferSink(audioTrack);
  const trackFirstTimestamp = await audioTrack.getFirstTimestamp();
  const trackDuration = await audioTrack.computeDuration();
  const sourceStart = trackFirstTimestamp + layer.sourceOffsetSeconds;
  const requestedSourceEnd =
    sourceStart + layer.durationSeconds * layer.playbackSpeed;
  const sourceEnd = Math.min(
    trackFirstTimestamp + trackDuration,
    requestedSourceEnd,
  );
  let scheduled = false;

  for await (const wrapped of sink.buffers(sourceStart, sourceEnd)) {
    const clippedStart = Math.max(sourceStart, wrapped.timestamp);
    const clippedEnd = Math.min(
      sourceEnd,
      wrapped.timestamp + wrapped.duration,
    );
    const sourceDuration = clippedEnd - clippedStart;

    if (sourceDuration <= 0) {
      continue;
    }

    const timelineStart =
      layer.startSeconds +
      (clippedStart - sourceStart) / layer.playbackSpeed;
    const timelineEnd = Math.min(
      outputDuration,
      timelineStart + sourceDuration / layer.playbackSpeed,
    );

    if (timelineEnd <= timelineStart) {
      continue;
    }

    const node = context.createBufferSource();
    const gain = context.createGain();
    const localStart = timelineStart - layer.startSeconds;
    const localEnd = timelineEnd - layer.startSeconds;
    node.buffer = wrapped.buffer;
    node.playbackRate.value = layer.playbackSpeed;
    gain.gain.setValueAtTime(
      getStudioEditorAudioGain(layer, localStart),
      timelineStart,
    );
    gain.gain.linearRampToValueAtTime(
      getStudioEditorAudioGain(layer, localEnd),
      timelineEnd,
    );
    node.connect(gain);
    gain.connect(context.destination);
    node.start(
      timelineStart,
      clippedStart - wrapped.timestamp,
      sourceDuration,
    );
    scheduled = true;
  }

  return scheduled;
}
