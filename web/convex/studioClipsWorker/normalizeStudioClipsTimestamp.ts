import { STUDIO_CLIPS_PERSISTENCE_LIMITS } from "../studioClipsTasks/studioClipsPersistenceLimits";

export function normalizeStudioClipsTimestamp(
  value: number,
  label: string,
): number {
  if (
    !Number.isFinite(value) ||
    value < 0 ||
    value > STUDIO_CLIPS_PERSISTENCE_LIMITS.inputDurationSeconds
  ) {
    throw new Error(`${label} is invalid.`);
  }
  return value;
}
