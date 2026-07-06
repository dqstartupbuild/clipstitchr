import type { ClipstitchrConfig } from "../config/ClipstitchrConfig.js";
import { defaultLongRecordingWarningSeconds } from "./defaultLongRecordingWarningSeconds.js";
import { defaultRecommendedRecordingDurationSeconds } from "./defaultRecommendedRecordingDurationSeconds.js";
import type { RecordingGuidance } from "./RecordingGuidance.js";

export function resolveRecordingGuidance(
  recording: ClipstitchrConfig["recording"],
): RecordingGuidance {
  return {
    longRecordingWarningSeconds:
      recording?.longRecordingWarningSeconds ??
      defaultLongRecordingWarningSeconds,
    recommendedDurationSeconds:
      recording?.recommendedDurationSeconds ??
      recording?.durationLimitSeconds ??
      defaultRecommendedRecordingDurationSeconds,
  };
}
