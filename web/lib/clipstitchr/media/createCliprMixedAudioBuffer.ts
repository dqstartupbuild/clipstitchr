import { AudioBufferSink, type Input } from "mediabunny";
import {
  OUTPUT_AUDIO_NUMBER_OF_CHANNELS,
  OUTPUT_AUDIO_SAMPLE_RATE,
} from "@/lib/clipstitchr/constants/audioOutputParameters";
import { CLIPR_MUSIC_AD_GAIN } from "@/lib/clipstitchr/constants/cliprMusicMix";
import { decodeAudioBlob } from "@/lib/clipstitchr/media/decodeAudioBlob";
import { getCliprMusicGain } from "@/lib/clipstitchr/media/getCliprMusicGain";
import { scheduleLoopingAudioBuffer } from "@/lib/clipstitchr/media/scheduleLoopingAudioBuffer";

type CreateCliprMixedAudioBufferOptions = {
  duration: number;
  musicBlob: Blob;
  videoInput: Input;
  volume: number;
};

export async function createCliprMixedAudioBuffer({
  duration,
  musicBlob,
  videoInput,
  volume,
}: CreateCliprMixedAudioBufferOptions) {
  const frameCount = Math.max(1, Math.ceil(duration * OUTPUT_AUDIO_SAMPLE_RATE));
  const context = new OfflineAudioContext(
    OUTPUT_AUDIO_NUMBER_OF_CHANNELS,
    frameCount,
    OUTPUT_AUDIO_SAMPLE_RATE,
  );
  const audioTrack = await videoInput.getPrimaryAudioTrack();
  const sourceOffset = audioTrack ? await audioTrack.getFirstTimestamp() : 0;
  const musicBuffer = await decodeAudioBlob(musicBlob);
  const musicGain = context.createGain();

  musicGain.gain.value = getCliprMusicGain({
    hasSourceAudio: Boolean(audioTrack),
    volume,
  });
  musicGain.connect(context.destination);
  scheduleLoopingAudioBuffer({
    buffer: musicBuffer,
    context,
    destination: musicGain,
    duration,
  });

  if (audioTrack) {
    const sink = new AudioBufferSink(audioTrack);

    for await (const {
      buffer,
      duration: bufferDuration,
      timestamp,
    } of sink.buffers()) {
      const source = context.createBufferSource();
      const gain = context.createGain();
      const startTime = Math.max(0, timestamp - sourceOffset);

      if (startTime >= duration) {
        break;
      }

      source.buffer = buffer;
      gain.gain.value = CLIPR_MUSIC_AD_GAIN;
      source.connect(gain).connect(context.destination);
      source.start(
        startTime,
        0,
        Math.min(bufferDuration, duration - startTime),
      );
    }
  }

  return await context.startRendering();
}
