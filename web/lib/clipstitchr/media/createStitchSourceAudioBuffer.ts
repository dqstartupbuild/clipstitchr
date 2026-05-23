import { AudioBufferSink, type Input } from "mediabunny";
import {
  OUTPUT_AUDIO_NUMBER_OF_CHANNELS,
  OUTPUT_AUDIO_SAMPLE_RATE,
} from "@/lib/clipstitchr/constants/audioOutputParameters";
import { schedulePlaybackRateAudioBuffer } from "@/lib/clipstitchr/media/schedulePlaybackRateAudioBuffer";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

type CreateStitchSourceAudioBufferOptions = {
  demoInput: Input;
  demoPlaybackRate?: VideoPlaybackRate;
  demoTimelineOffset: number;
  demoTrimRange: VideoTrimRange;
  includeDemoAudio: boolean;
  includeUgcAudio: boolean;
  outputDuration: number;
  ugcInput: Input;
  ugcPlaybackRate?: VideoPlaybackRate;
  ugcTrimRange: VideoTrimRange;
};

export async function createStitchSourceAudioBuffer({
  demoInput,
  demoPlaybackRate = 1,
  demoTimelineOffset,
  demoTrimRange,
  includeDemoAudio,
  includeUgcAudio,
  outputDuration,
  ugcInput,
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
      timelineOffset: 0,
      trimRange: ugcTrimRange,
    },
    {
      includeAudio: includeDemoAudio,
      input: demoInput,
      playbackRate: demoPlaybackRate,
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
    const sourceStartTimestamp = sourceOffset + segment.trimRange.start;
    const sourceEndTimestamp = sourceOffset + segment.trimRange.end;

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
        timelineOffset: segment.timelineOffset,
        timestamp,
      });
    }
  }

  return await context.startRendering();
}
