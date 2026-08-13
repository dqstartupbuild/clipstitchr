export function readLazyReelOptionalText(value: string | undefined, maximum = 2_000) {
  const trimmed = value?.trim() ?? "";
  if (trimmed.length > maximum) {
    throw new TypeError(`Text input must be ${maximum.toLocaleString()} characters or fewer.`);
  }
  return trimmed;
}
