import {
  OUTPUT_AUDIO_NUMBER_OF_CHANNELS,
  OUTPUT_AUDIO_SAMPLE_RATE,
} from "@/lib/clipstitchr/constants/audioOutputParameters";

export async function decodeAudioBlob(blob: Blob) {
  const context = new OfflineAudioContext(
    OUTPUT_AUDIO_NUMBER_OF_CHANNELS,
    OUTPUT_AUDIO_SAMPLE_RATE,
    OUTPUT_AUDIO_SAMPLE_RATE,
  );

  return await context.decodeAudioData(await blob.arrayBuffer());
}
