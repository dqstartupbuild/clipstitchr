import { CanvasSource } from "mediabunny";
import type { VideoCodec } from "mediabunny";

export function createTikTokCanvasSource(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  videoCodec: VideoCodec,
) {
  return new CanvasSource(canvas, {
    codec: videoCodec,
    bitrate: 8_000_000,
    keyFrameInterval: 2,
  });
}
