export function normalizeProductPainPoints(values: string[] | undefined) {
  return (values ?? []).map((value) => value.trim()).filter(Boolean);
}
