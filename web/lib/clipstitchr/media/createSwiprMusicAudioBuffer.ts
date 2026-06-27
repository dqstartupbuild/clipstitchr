import {
  OUTPUT_AUDIO_NUMBER_OF_CHANNELS,
  OUTPUT_AUDIO_SAMPLE_RATE,
} from "@/lib/clipstitchr/constants/audioOutputParameters";
import { decodeAudioBlob } from "@/lib/clipstitchr/media/decodeAudioBlob";

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
  const musicSource = context.createBufferSource();
  const musicGain = context.createGain();

  musicSource.buffer = musicBuffer;
  musicGain.gain.value = volume;
  musicSource.connect(musicGain).connect(context.destination);
  musicSource.start(0, 0, Math.min(duration, musicBuffer.duration));

  return await context.startRendering();
}
