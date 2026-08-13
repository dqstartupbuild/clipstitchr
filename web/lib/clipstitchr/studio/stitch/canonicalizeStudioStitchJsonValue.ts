export function canonicalizeStudioStitchJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalizeStudioStitchJsonValue);
  }
  if (typeof value === "object" && value !== null) {
    return Object.keys(value)
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        result[key] = canonicalizeStudioStitchJsonValue(
          (value as Record<string, unknown>)[key],
        );
        return result;
      }, {});
  }
  return value;
}
