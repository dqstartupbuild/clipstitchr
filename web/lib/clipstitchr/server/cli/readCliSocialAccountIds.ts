export function readCliSocialAccountIds(body: Record<string, unknown>) {
  const value = body.socialAccountIds;

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "number" ? item : Number(item)))
    .filter((item) => Number.isInteger(item) && item > 0);
}
