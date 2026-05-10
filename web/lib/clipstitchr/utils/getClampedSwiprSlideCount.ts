import {
  SWIPR_MAX_SLIDE_COUNT,
  SWIPR_MIN_SLIDE_COUNT,
} from "@/lib/clipstitchr/constants/swiprSlideCountBounds";
import { clamp } from "@/lib/clipstitchr/utils/clamp";

export function getClampedSwiprSlideCount(count: number) {
  return Math.round(
    clamp(count, SWIPR_MIN_SLIDE_COUNT, SWIPR_MAX_SLIDE_COUNT),
  );
}
