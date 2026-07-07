export function readCliDemoAppContextStringArray(
  value: unknown,
  maxItems: number,
  maxLength: number,
) {
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim().slice(0, maxLength))
        .filter(Boolean)
        .slice(0, maxItems)
    : [];
}
