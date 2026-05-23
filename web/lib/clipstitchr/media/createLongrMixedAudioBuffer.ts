import { AudioBufferSink, type Input } from "mediabunny";
import {
  OUTPUT_AUDIO_NUMBER_OF_CHANNELS,
  OUTPUT_AUDIO_SAMPLE_RATE,
} from "@/lib/clipstitchr/constants/audioOutputParameters";
import { decodeAudioBlob } from "@/lib/clipstitchr/media/decodeAudioBlob";
import { getCliprMusicGain } from "@/lib/clipstitchr/media/getCliprMusicGain";
import { schedulePlaybackRateAudioBuffer } from "@/lib/clipstitchr/media/schedulePlaybackRateAudioBuffer";
import type { LongrSequenceMusicClip } from "@/lib/clipstitchr/types/LongrSequenceMusicClip";
import type { VideoPlaybackRate } from "@/lib/clipstitchr/types/VideoPlaybackRate";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";
import { clamp } from "@/lib/clipstitchr/utils/clamp";

type CreateLongrMixedAudioBufferOptions = {
  inputs: Input[];
  musicClips: LongrSequenceMusicClip[];
  outputDuration: number;
  playbackRates: VideoPlaybackRate[];
  timelineOffsets: number[];
  trimRanges: VideoTrimRange[];
};

export async function createLongrMixedAudioBuffer({
  inputs,
  musicClips,
  outputDuration,
  playbackRates,
  timelineOffsets,
  trimRanges,
}: CreateLongrMixedAudioBufferOptions) {
  const frameCount = Math.max(
    1,
    Math.ceil(outputDuration * OUTPUT_AUDIO_SAMPLE_RATE),
  );
  const context = new OfflineAudioContext(
    OUTPUT_AUDIO_NUMBER_OF_CHANNELS,
    frameCount,
    OUTPUT_AUDIO_SAMPLE_RATE,
  );
  const audioTracks = await Promise.all(
    inputs.map((input) => input.getPrimaryAudioTrack()),
  );
  const hasSourceAudio = audioTracks.some(Boolean);

  for (let index = 0; index < inputs.length; index += 1) {
    const audioTrack = audioTracks[index];

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

  for (const musicClip of musicClips) {
    const musicBuffer = await decodeAudioBlob(musicClip.blob);
    const sourceStartSeconds = clamp(
      musicClip.sourceStartSeconds,
      0,
      musicBuffer.duration,
    );
    const sourceEndSeconds = clamp(
      Math.max(sourceStartSeconds, musicClip.sourceEndSeconds),
      sourceStartSeconds,
      musicBuffer.duration,
    );
    const startTime = clamp(
      musicClip.timelineStartSeconds,
      0,
      outputDuration,
    );
    const playableDuration = Math.min(
      sourceEndSeconds - sourceStartSeconds,
      Math.max(0, outputDuration - startTime),
    );

    if (playableDuration <= 0) {
      continue;
    }

    const source = context.createBufferSource();
    const gain = context.createGain();

    source.buffer = musicBuffer;
    gain.gain.value = getCliprMusicGain({
      hasSourceAudio,
      volume: musicClip.volume,
    });
    source.connect(gain).connect(context.destination);
    source.start(startTime, sourceStartSeconds, playableDuration);
  }

  return await context.startRendering();
}
