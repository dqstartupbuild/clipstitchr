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

type CreateStitchSourceAudioBufferOptions = {
  demoInput: Input;
  demoQuickEdit?: QuickEditSuggestions;
  demoPlaybackRate?: VideoPlaybackRate;
  demoTimelineOffset: number;
  demoTrimRange: VideoTrimRange;
  includeDemoAudio: boolean;
  includeUgcAudio: boolean;
  outputDuration: number;
  ugcInput: Input;
  ugcQuickEdit?: QuickEditSuggestions;
  ugcPlaybackRate?: VideoPlaybackRate;
  ugcTrimRange: VideoTrimRange;
};

export async function createStitchSourceAudioBuffer({
  demoInput,
  demoQuickEdit,
  demoPlaybackRate = 1,
  demoTimelineOffset,
  demoTrimRange,
  includeDemoAudio,
  includeUgcAudio,
  outputDuration,
  ugcInput,
  ugcQuickEdit,
  ugcPlaybackRate = 1,
  ugcTrimRange,
}: CreateStitchSourceAudioBufferOptions) {
  const frameCount = Math.max(
    1,
    Math.ceil(outputDuration * OUTPUT_AUDIO_SAMPLE_RATE),
  );
  const context = new OfflineAudioContext(
    OUTPUT_AUDIO_NUMBER_OF_CHANNELS,
    frameCount,
    OUTPUT_AUDIO_SAMPLE_RATE,
  );
  const segments = [
    {
      includeAudio: includeUgcAudio,
      input: ugcInput,
      playbackRate: ugcPlaybackRate,
      quickEdit: ugcQuickEdit,
      timelineOffset: 0,
      trimRange: ugcTrimRange,
    },
    {
      includeAudio: includeDemoAudio,
      input: demoInput,
      playbackRate: demoPlaybackRate,
      quickEdit: demoQuickEdit,
      timelineOffset: demoTimelineOffset,
      trimRange: demoTrimRange,
    },
  ];

  for (const segment of segments) {
    if (!segment.includeAudio) {
      continue;
    }

    const audioTrack = await segment.input.getPrimaryAudioTrack();

    if (!audioTrack) {
      continue;
    }

    const sink = new AudioBufferSink(audioTrack);
    const sourceOffset = await audioTrack.getFirstTimestamp();
    const trackDuration = await audioTrack.computeDuration();
    const playableRanges = getQuickEditPlayableRanges(
      segment.trimRange,
      trackDuration,
      segment.quickEdit?.removeRanges,
    );
    let timelineOffset = segment.timelineOffset;

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
          playbackRate: segment.playbackRate,
          sourceEndTimestamp,
          sourceStartTimestamp,
          timelineOffset,
          timestamp,
        });
      }

      timelineOffset += getPlaybackRateDuration(
        playableRange,
        segment.playbackRate,
      );
    }
  }

  return await context.startRendering();
}
