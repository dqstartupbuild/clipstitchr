export function normalizeStudioClipsLanguageCode(
  value: unknown,
): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const normalized = value.trim().replace(/_/g, "-");
  return /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})?$/.test(normalized)
    ? normalized
    : undefined;
}
