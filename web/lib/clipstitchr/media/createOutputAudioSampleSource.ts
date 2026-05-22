import { AudioSampleSource } from "mediabunny";
import type { AudioCodec } from "mediabunny";

export function createOutputAudioSampleSource(
  includeAudio: boolean,
  audioCodec: AudioCodec | null,
) {
  return includeAudio
    ? new AudioSampleSource({
        codec: audioCodec ?? "aac",
        bitrate: 160_000,
      })
    : null;
}
