import {
  TIKTOK_OUTPUT_HEIGHT,
  TIKTOK_OUTPUT_WIDTH,
} from "@/lib/clipr/constants/tiktokOutputSize";

const SWAPR_ASPECT_RATIO_TOLERANCE = 0.01;

export function getImageNeedsSwaprOutpaint(width: number, height: number) {
  const aspectRatio = width / height;
  const targetAspectRatio = TIKTOK_OUTPUT_WIDTH / TIKTOK_OUTPUT_HEIGHT;

  return Math.abs(aspectRatio - targetAspectRatio) > SWAPR_ASPECT_RATIO_TOLERANCE;
}
