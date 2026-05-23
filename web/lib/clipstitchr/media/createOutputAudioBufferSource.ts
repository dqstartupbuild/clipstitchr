import { AudioBufferSource } from "mediabunny";
import type { AudioCodec } from "mediabunny";
import {
  OUTPUT_AUDIO_NUMBER_OF_CHANNELS,
  OUTPUT_AUDIO_SAMPLE_RATE,
} from "@/lib/clipstitchr/constants/audioOutputParameters";

export function createOutputAudioBufferSource(
  includeAudio: boolean,
  audioCodec: AudioCodec | null,
) {
  return includeAudio
    ? new AudioBufferSource({
        codec: audioCodec ?? "aac",
        bitrate: 160_000,
        transform: {
          numberOfChannels: OUTPUT_AUDIO_NUMBER_OF_CHANNELS,
          sampleRate: OUTPUT_AUDIO_SAMPLE_RATE,
        },
      })
    : null;
}
