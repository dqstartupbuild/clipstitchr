export function assertStudioEditorUploadObjectKey(
  objectKey: string,
  ownerId: string,
  productId: string,
): void {
  const prefix = `users/${encodeURIComponent(ownerId)}/studio/v1/media-source/${encodeURIComponent(productId)}/`;
  const relativeKey = objectKey.slice(prefix.length);
  if (
    objectKey.length <= prefix.length ||
    objectKey.length > 1_024 ||
    !objectKey.startsWith(prefix) ||
    relativeKey.split("/").some((segment) => segment.length === 0) ||
    relativeKey.includes("..") ||
    relativeKey.includes("\\") ||
    relativeKey.includes("?") ||
    relativeKey.includes("#") ||
    /%(?:2e|2f|5c)/iu.test(relativeKey) ||
    /[\u0000-\u001f\u007f]/u.test(relativeKey)
  ) {
    throw new Error(
      "A Studio editor upload source is outside this Product or account.",
    );
  }
}
