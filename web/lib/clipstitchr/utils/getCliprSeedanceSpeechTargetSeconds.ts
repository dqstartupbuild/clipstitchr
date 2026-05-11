import {
  CLIPR_SEEDANCE_AUDIO_PADDING_SECONDS,
  CLIPR_SEEDANCE_MIN_DURATION_SECONDS,
} from "@/lib/clipstitchr/constants/cliprSeedanceSettings";

export function getCliprSeedanceSpeechTargetSeconds(segmentDuration: number) {
  return Math.max(
    CLIPR_SEEDANCE_MIN_DURATION_SECONDS,
    segmentDuration - CLIPR_SEEDANCE_AUDIO_PADDING_SECONDS,
  );
}
