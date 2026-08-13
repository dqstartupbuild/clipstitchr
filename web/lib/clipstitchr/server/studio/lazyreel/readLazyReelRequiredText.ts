export function readLazyReelRequiredText(value: string, label: string, maximum = 20_000) {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new TypeError(`${label} is required.`);
  }
  if (trimmed.length > maximum) {
    throw new TypeError(`${label} must be ${maximum.toLocaleString()} characters or fewer.`);
  }
  return trimmed;
}
