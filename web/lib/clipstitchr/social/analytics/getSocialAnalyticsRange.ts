import type { SocialAnalyticsRangePreset } from "./SocialAnalyticsRangePreset";

export function getSocialAnalyticsRange({
  preset,
  customStart,
  customEnd,
  now,
}: {
  preset: SocialAnalyticsRangePreset;
  customStart: string;
  customEnd: string;
  now: string;
}) {
  if (preset === "custom") {
    const rangeStartMs = Date.parse(customStart);
    const rangeEndMs = Date.parse(customEnd);
    const isValid =
      Number.isFinite(rangeStartMs) &&
      Number.isFinite(rangeEndMs) &&
      rangeStartMs <= rangeEndMs;

    return {
      rangeStart: isValid ? new Date(rangeStartMs).toISOString() : now,
      rangeEnd: isValid ? new Date(rangeEndMs).toISOString() : now,
      isValid,
    };
  }

  const durationMs =
    preset === "24_hours"
      ? 24 * 60 * 60 * 1_000
      : preset === "7_days"
        ? 7 * 24 * 60 * 60 * 1_000
        : 30 * 24 * 60 * 60 * 1_000;
  const rangeEndMs = Date.parse(now);

  return {
    rangeStart: new Date(rangeEndMs - durationMs).toISOString(),
    rangeEnd: now,
    isValid: true,
  };
}
