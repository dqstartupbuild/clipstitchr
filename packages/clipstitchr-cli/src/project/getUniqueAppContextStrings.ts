import { normalizeAppContextText } from "./normalizeAppContextText.js";

export function getUniqueAppContextStrings(values: string[], maxItems: number) {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const value of values) {
    const normalizedValue = normalizeAppContextText(value);
    const key = normalizedValue.toLowerCase();

    if (!normalizedValue || seen.has(key)) {
      continue;
    }

    seen.add(key);
    output.push(normalizedValue);

    if (output.length >= maxItems) {
      break;
    }
  }

  return output;
}
