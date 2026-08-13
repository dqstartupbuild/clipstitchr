import type { StudioClipsPlatformPreset } from "../../../../lib/clipstitchr/types/studioClips/StudioClipsPlatformPreset";

export type StudioClipsPlatformRenderPreset = {
  audioBitrate: "192k";
  audioCodec: "aac";
  fileSuffix: string;
  frameRate: 30;
  height: 1920;
  maximumDurationSeconds: 180;
  name: StudioClipsPlatformPreset;
  pixelFormat: "yuv420p";
  videoCodec: "libx264";
  videoBufferSize: "20M" | "24M";
  videoMaximumRate: "10M" | "12M";
  width: 1080;
};
