export function getHookLabFinalizationString(value, label) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing ${label}.`);
  }

  return value.trim();
}
