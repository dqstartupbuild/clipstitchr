import {
  SWIPR_MAX_SLIDE_COUNT,
  SWIPR_MIN_SLIDE_COUNT,
} from "@/lib/clipstitchr/constants/swiprSlideCountBounds";

export const SWIPR_SLIDE_COUNT_OPTIONS = Array.from(
  { length: SWIPR_MAX_SLIDE_COUNT - SWIPR_MIN_SLIDE_COUNT + 1 },
  (_, index) => SWIPR_MIN_SLIDE_COUNT + index,
);
