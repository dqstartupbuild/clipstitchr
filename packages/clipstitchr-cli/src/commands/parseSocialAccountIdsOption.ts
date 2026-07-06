export function parseSocialAccountIdsOption(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  const ids = value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((part) => Number.isInteger(part) && part > 0);

  if (!ids.length) {
    throw new Error("Use a comma-separated list of Post Bridge account IDs.");
  }

  return [...new Set(ids)];
}
