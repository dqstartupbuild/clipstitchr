export function normalizePublicHookText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}
