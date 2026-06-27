import {
  OUTPUT_AUDIO_NUMBER_OF_CHANNELS,
  OUTPUT_AUDIO_SAMPLE_RATE,
} from "@/lib/clipstitchr/constants/audioOutputParameters";
import { decodeAudioBlob } from "@/lib/clipstitchr/media/decodeAudioBlob";
import { scheduleLoopingAudioBuffer } from "@/lib/clipstitchr/media/scheduleLoopingAudioBuffer";

type CreateSwiprMusicAudioBufferOptions = {
  duration: number;
  musicBlob: Blob;
  volume: number;
};

export async function createSwiprMusicAudioBuffer({
  duration,
  musicBlob,
  volume,
}: CreateSwiprMusicAudioBufferOptions) {
  const frameCount = Math.max(1, Math.ceil(duration * OUTPUT_AUDIO_SAMPLE_RATE));
  const context = new OfflineAudioContext(
    OUTPUT_AUDIO_NUMBER_OF_CHANNELS,
    frameCount,
    OUTPUT_AUDIO_SAMPLE_RATE,
  );
  const musicBuffer = await decodeAudioBlob(musicBlob);
  const musicGain = context.createGain();

  musicGain.gain.value = volume;
  musicGain.connect(context.destination);
  scheduleLoopingAudioBuffer({
    buffer: musicBuffer,
    context,
    destination: musicGain,
    duration,
  });

  return await context.startRendering();
}
