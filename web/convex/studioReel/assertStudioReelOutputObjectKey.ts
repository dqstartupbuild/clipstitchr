export function assertStudioReelOutputObjectKey(
  objectKey: string,
  ownerId: string,
) {
  const normalized = objectKey.trim();
  const prefix = `users/${encodeURIComponent(ownerId)}/studio/v1/media-output/`;
  if (
    normalized.length === 0 ||
    normalized.length > 1_000 ||
    normalized.includes("://") ||
    !normalized.startsWith(prefix)
  ) {
    throw new Error("Studio Stitch output object is outside this account.");
  }

  return normalized;
}
