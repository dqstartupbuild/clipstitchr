export function readStudioClipsTranscriptTimestamp(
  value: string,
): number | undefined {
  const parts = value.split(":").map(Number);
  if (parts.some((part) => !Number.isFinite(part))) return undefined;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) {
    return parts[0] * 3_600 + parts[1] * 60 + parts[2];
  }
  return undefined;
}
