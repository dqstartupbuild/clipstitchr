import type { AudioCodec, VideoCodec } from "mediabunny";

export type OutputCodecs = {
  videoCodec: VideoCodec | null;
  audioCodec: AudioCodec | null;
  warnings: string[];
};
