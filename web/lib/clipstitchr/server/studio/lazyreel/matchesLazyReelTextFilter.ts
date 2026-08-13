import { normalizeLazyReelText } from "./normalizeLazyReelText";

export function matchesLazyReelTextFilter(value: string | null | undefined, filter: string) {
  const normalizedValue = normalizeLazyReelText(value ?? "");
  const normalizedFilter = normalizeLazyReelText(filter);

  if (!normalizedValue || !normalizedFilter) {
    return false;
  }

  return (
    normalizedValue === normalizedFilter ||
    normalizedValue.includes(normalizedFilter) ||
    normalizedFilter.includes(normalizedValue)
  );
}
