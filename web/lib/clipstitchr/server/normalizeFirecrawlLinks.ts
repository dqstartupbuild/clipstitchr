export function normalizeFirecrawlLinks(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
        .filter(Boolean),
    ),
  ).slice(0, 30);
}
