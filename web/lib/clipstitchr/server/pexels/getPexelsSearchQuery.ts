export function getPexelsSearchQuery(value: unknown) {
  const query = typeof value === "string" ? value.trim().slice(0, 120) : "";

  if (!query) {
    throw new Error("Search for a photo first.");
  }

  return query;
}
