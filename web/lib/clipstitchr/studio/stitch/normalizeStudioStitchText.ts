export function normalizeStudioStitchText(
  value: string,
  fieldName: string,
  maximumCharacters = 2_000,
): string {
  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string.`);
  }
  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length === 0 || normalized.length > maximumCharacters) {
    throw new Error(
      `${fieldName} must contain 1 through ${maximumCharacters} characters.`,
    );
  }
  return normalized;
}
