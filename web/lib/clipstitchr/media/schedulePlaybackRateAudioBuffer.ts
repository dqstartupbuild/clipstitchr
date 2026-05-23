import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";

type SchedulePlaybackRateAudioBufferOptions = {
  buffer: AudioBuffer;
  context: OfflineAudioContext;
  duration: number;
  outputDuration: number;
  playbackRate?: VideoPlaybackRate;
  sourceEndTimestamp: number;
  sourceStartTimestamp: number;
  timelineOffset: number;
  timestamp: number;
  volume?: number;
};

export function schedulePlaybackRateAudioBuffer({
  buffer,
  context,
  duration,
  outputDuration,
  playbackRate = 1,
  sourceEndTimestamp,
  sourceStartTimestamp,
  timelineOffset,
  timestamp,
  volume = 1,
}: SchedulePlaybackRateAudioBufferOptions) {
  const sourcePlayableStart = Math.max(timestamp, sourceStartTimestamp);
  const sourcePlayableEnd = Math.min(
    timestamp + duration,
    sourceEndTimestamp,
  );
  const sourceDuration = Math.max(0, sourcePlayableEnd - sourcePlayableStart);
  const startTime =
    timelineOffset +
    Math.max(0, sourcePlayableStart - sourceStartTimestamp) / playbackRate;
  const playableDuration = Math.min(
    sourceDuration,
    Math.max(0, outputDuration - startTime) * playbackRate,
  );

  if (playableDuration <= 0) {
    return false;
  }

  const source = context.createBufferSource();
  const gain = context.createGain();

  source.buffer = buffer;
  source.playbackRate.value = playbackRate;
  gain.gain.value = volume;
  source.connect(gain).connect(context.destination);
  source.start(startTime, sourcePlayableStart - timestamp, playableDuration);

  return true;
}
