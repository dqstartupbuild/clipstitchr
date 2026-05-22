import { VideoSampleSource } from "mediabunny";
import type { VideoCodec } from "mediabunny";
import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipstitchr/constants/tiktokOutputSize";

export function createTikTokVideoSampleSource(videoCodec: VideoCodec) {
  return new VideoSampleSource({
    codec: videoCodec,
    bitrate: 8_000_000,
    keyFrameInterval: 2,
    sizeChangeBehavior: "contain",
    transform: {
      width: TIKTOK_OUTPUT_WIDTH,
      height: TIKTOK_OUTPUT_HEIGHT,
    },
  });
}
