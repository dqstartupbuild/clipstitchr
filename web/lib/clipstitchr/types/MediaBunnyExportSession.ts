import type {
  AudioSampleSource,
  BufferTarget,
  Mp4OutputFormat,
  Output,
  VideoSource,
} from "mediabunny";

export type MediaBunnyExportSession<
  VideoSourceType extends VideoSource = VideoSource,
> = {
  audioSource: AudioSampleSource | null;
  output: Output<Mp4OutputFormat, BufferTarget>;
  videoSource: VideoSourceType;
};
