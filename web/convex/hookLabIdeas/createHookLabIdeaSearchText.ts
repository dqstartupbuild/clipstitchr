export function createHookLabIdeaSearchText(values: (string | undefined)[]) {
  return values
    .filter((value): value is string => Boolean(value?.trim()))
    .join(" ")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .slice(0, 4000);
}
