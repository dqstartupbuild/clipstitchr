import {
  CLIPR_SEEDANCE_MAX_DURATION_SECONDS,
  CLIPR_SEEDANCE_MIN_DURATION_SECONDS,
} from "@/lib/clipstitchr/constants/cliprSeedanceSettings";

export function getCliprSeedanceSegmentDurationSeconds(
  remainingSeconds: number,
) {
  if (!Number.isFinite(remainingSeconds)) {
    return CLIPR_SEEDANCE_MAX_DURATION_SECONDS;
  }

  return Math.min(
    CLIPR_SEEDANCE_MAX_DURATION_SECONDS,
    Math.max(CLIPR_SEEDANCE_MIN_DURATION_SECONDS, Math.ceil(remainingSeconds)),
  );
}
