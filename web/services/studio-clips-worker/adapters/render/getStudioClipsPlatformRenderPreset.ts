import type { StudioClipsPlatformPreset } from "../../../../lib/clipstitchr/types/studioClips/StudioClipsPlatformPreset";
import type { StudioClipsPlatformRenderPreset } from "./StudioClipsPlatformRenderPreset";

const presets: Record<StudioClipsPlatformPreset, StudioClipsPlatformRenderPreset> = {
  instagram_reels: {
    audioBitrate: "192k",
    audioCodec: "aac",
    fileSuffix: "instagram-reels",
    frameRate: 30,
    height: 1920,
    maximumDurationSeconds: 180,
    name: "instagram_reels",
    pixelFormat: "yuv420p",
    videoCodec: "libx264",
    videoBufferSize: "24M",
    videoMaximumRate: "12M",
    width: 1080,
  },
  tiktok: {
    audioBitrate: "192k",
    audioCodec: "aac",
    fileSuffix: "tiktok",
    frameRate: 30,
    height: 1920,
    maximumDurationSeconds: 180,
    name: "tiktok",
    pixelFormat: "yuv420p",
    videoCodec: "libx264",
    videoBufferSize: "20M",
    videoMaximumRate: "10M",
    width: 1080,
  },
  youtube_shorts: {
    audioBitrate: "192k",
    audioCodec: "aac",
    fileSuffix: "youtube-shorts",
    frameRate: 30,
    height: 1920,
    maximumDurationSeconds: 180,
    name: "youtube_shorts",
    pixelFormat: "yuv420p",
    videoCodec: "libx264",
    videoBufferSize: "20M",
    videoMaximumRate: "10M",
    width: 1080,
  },
};

export function getStudioClipsPlatformRenderPreset(
  preset: StudioClipsPlatformPreset,
): StudioClipsPlatformRenderPreset {
  return presets[preset];
}
