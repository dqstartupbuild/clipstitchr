export function readSwiprLibraryQuery(value: unknown) {
  const query = typeof value === "string" ? value.trim() : "";

  if (!query) {
    throw new Error("Enter a photo search first.");
  }

  return query.slice(0, 120);
}
