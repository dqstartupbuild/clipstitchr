import { AudioBufferSink, type Input } from "mediabunny";
import {
  OUTPUT_AUDIO_NUMBER_OF_CHANNELS,
  OUTPUT_AUDIO_SAMPLE_RATE,
} from "@/lib/clipstitchr/constants/audioOutputParameters";
import { schedulePlaybackRateAudioBuffer } from "@/lib/clipstitchr/media/schedulePlaybackRateAudioBuffer";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

type CreateStitchrSequenceAudioBufferOptions = {
  includeAudioFlags: boolean[];
  inputs: Input[];
  outputDuration: number;
  playbackRates: VideoPlaybackRate[];
  timelineOffsets: number[];
  trimRanges: VideoTrimRange[];
};

export async function createStitchrSequenceAudioBuffer({
  includeAudioFlags,
  inputs,
  outputDuration,
  playbackRates,
  timelineOffsets,
  trimRanges,
}: CreateStitchrSequenceAudioBufferOptions) {
  const frameCount = Math.max(
    1,
    Math.ceil(outputDuration * OUTPUT_AUDIO_SAMPLE_RATE),
  );
  const context = new OfflineAudioContext(
    OUTPUT_AUDIO_NUMBER_OF_CHANNELS,
    frameCount,
    OUTPUT_AUDIO_SAMPLE_RATE,
  );

  for (let index = 0; index < inputs.length; index += 1) {
    if (!includeAudioFlags[index]) {
      continue;
    }

    const audioTrack = await inputs[index]?.getPrimaryAudioTrack();

    if (!audioTrack) {
      continue;
    }

    const sink = new AudioBufferSink(audioTrack);
    const trimRange = trimRanges[index];
    const sourceOffset = await audioTrack.getFirstTimestamp();
    const sourceStartTimestamp = sourceOffset + trimRange.start;
    const sourceEndTimestamp = sourceOffset + trimRange.end;
    const timelineOffset = timelineOffsets[index] ?? 0;
    const playbackRate = playbackRates[index] ?? 1;

    for await (const {
      buffer,
      duration,
      timestamp,
    } of sink.buffers(sourceStartTimestamp, sourceEndTimestamp)) {
      schedulePlaybackRateAudioBuffer({
        buffer,
        context,
        duration,
        outputDuration,
        playbackRate,
        sourceEndTimestamp,
        sourceStartTimestamp,
        timelineOffset,
        timestamp,
      });
    }
  }

  return await context.startRendering();
}
