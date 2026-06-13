export function normalizeFirecrawlText(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\n{3,}/g, "\n\n") : "";
}
