export function normalizeProductProfileOptionalText(value: string | undefined) {
  const trimmed = value?.trim() ?? "";

  return trimmed || undefined;
}
