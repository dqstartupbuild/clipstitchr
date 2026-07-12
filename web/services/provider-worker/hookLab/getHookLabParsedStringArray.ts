import { getHookLabParsedString } from "./getHookLabParsedString";

export function getHookLabParsedStringArray(
  value: unknown,
  limit = 12,
  maxLength = 240,
) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map((entry) => getHookLabParsedString(entry, "", maxLength))
        .filter(Boolean),
    ),
  ).slice(0, limit);
}
