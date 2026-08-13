export function assertStudioLazyReelBoundedString(
  value: string,
  options: { label: string; maxLength: number },
) {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${options.label} is required.`);
  }

  if (normalized.length > options.maxLength) {
    throw new Error(
      `${options.label} must be ${options.maxLength} characters or fewer.`,
    );
  }

  return normalized;
}
