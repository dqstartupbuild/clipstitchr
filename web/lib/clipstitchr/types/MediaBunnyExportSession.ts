import type {
  AudioSource,
  BufferTarget,
  Mp4OutputFormat,
  Output,
  VideoSource,
} from "mediabunny";

export type MediaBunnyExportSession<
  VideoSourceType extends VideoSource = VideoSource,
  AudioSourceType extends AudioSource | null = AudioSource | null,
> = {
  audioSource: AudioSourceType;
  output: Output<Mp4OutputFormat, BufferTarget>;
  videoSource: VideoSourceType;
};
