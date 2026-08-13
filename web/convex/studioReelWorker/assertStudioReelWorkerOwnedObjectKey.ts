export function assertStudioReelWorkerOwnedObjectKey(
  ownerId: string,
  objectKey: string,
) {
  const prefix = `users/${encodeURIComponent(ownerId)}/`;
  if (
    objectKey.length <= prefix.length ||
    objectKey.length > 1_000 ||
    !objectKey.startsWith(prefix) ||
    objectKey.includes("..") ||
    objectKey.includes("\\") ||
    objectKey.includes("?") ||
    objectKey.includes("#") ||
    /[\u0000-\u001f\u007f]/.test(objectKey)
  ) {
    throw new Error("Studio Stitch source object is outside this account.");
  }
  return objectKey;
}
