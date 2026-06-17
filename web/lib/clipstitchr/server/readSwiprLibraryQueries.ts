export function readSwiprLibraryQueries(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
        .filter(Boolean)
        .map((entry) => entry.slice(0, 120)),
    ),
  ).slice(0, 20);
}
