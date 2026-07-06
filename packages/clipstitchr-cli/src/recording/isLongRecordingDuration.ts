export function isLongRecordingDuration(
  durationSeconds: number | null,
  warningSeconds: number,
) {
  return (
    durationSeconds !== null &&
    Number.isFinite(durationSeconds) &&
    Number.isFinite(warningSeconds) &&
    durationSeconds >= warningSeconds
  );
}
