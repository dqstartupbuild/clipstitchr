export function formatIso8601Duration(durationSeconds: number) {
  return `PT${Math.max(1, Math.round(durationSeconds))}S`;
}
