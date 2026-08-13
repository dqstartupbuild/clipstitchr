export function assertStudioReelWorkerIdentifier(value: string, label: string) {
  const normalized = value.trim();
  if (
    normalized.length === 0 ||
    normalized.length > 200 ||
    !/^[A-Za-z0-9:_-]+$/.test(normalized)
  ) {
    throw new Error(`${label} is invalid.`);
  }
  return normalized;
}
