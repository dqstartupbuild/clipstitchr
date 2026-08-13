export function assertStudioClipsBoundedText(
  value: string,
  input: { label: string; maxLength: number; optional?: boolean },
) {
  const normalized = value.trim();
  if (
    (!input.optional && normalized.length === 0) ||
    normalized.length > input.maxLength
  ) {
    throw new Error(`${input.label} is invalid.`);
  }
  return normalized;
}
