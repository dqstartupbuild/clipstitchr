import { AudioBufferSink, type Input } from "mediabunny";
import {
  OUTPUT_AUDIO_NUMBER_OF_CHANNELS,
  OUTPUT_AUDIO_SAMPLE_RATE,
} from "@/lib/clipstitchr/constants/audioOutputParameters";
import { schedulePlaybackRateAudioBuffer } from "@/lib/clipstitchr/media/schedulePlaybackRateAudioBuffer";
import type { QuickEditSuggestions } from "@/lib/clipstitchr/types/QuickEditSuggestions";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { getQuickEditPlayableRanges } from "@/lib/clipstitchr/utils/getQuickEditPlayableRanges";
import { getPlaybackRateDuration } from "@/lib/clipstitchr/utils/getPlaybackRateDuration";

type CreateStitchrSequenceAudioBufferOptions = {
  includeAudioFlags: boolean[];
  inputs: Input[];
  outputDuration: number;
  playbackRates: VideoPlaybackRate[];
  quickEdits?: (QuickEditSuggestions | undefined)[];
  timelineOffsets: number[];
  trimRanges: VideoTrimRange[];
};

export async function createStitchrSequenceAudioBuffer({
  includeAudioFlags,
  inputs,
  outputDuration,
  playbackRates,
  quickEdits = [],
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
    const trackDuration = await audioTrack.computeDuration();
    const playableRanges = getQuickEditPlayableRanges(
      trimRange,
      trackDuration,
      quickEdits[index]?.removeRanges,
    );
    let timelineOffset = timelineOffsets[index] ?? 0;
    const playbackRate = playbackRates[index] ?? 1;

    for (const playableRange of playableRanges) {
      const sourceStartTimestamp = sourceOffset + playableRange.start;
      const sourceEndTimestamp = sourceOffset + playableRange.end;

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

      timelineOffset += getPlaybackRateDuration(playableRange, playbackRate);
    }
  }

  return await context.startRendering();
}
