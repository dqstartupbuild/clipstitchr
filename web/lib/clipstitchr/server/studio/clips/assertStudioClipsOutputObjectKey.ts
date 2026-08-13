export function assertStudioClipsOutputObjectKey(input: {
  objectKey: string;
  ownerId: string;
  productId: string;
  workId: string;
}): void {
  const prefix = [
    `users/${encodeURIComponent(input.ownerId)}/studio/v1/studio-clips`,
    encodeURIComponent(input.productId),
    encodeURIComponent(input.workId),
    "",
  ].join("/");
  if (
    input.objectKey.length <= prefix.length ||
    input.objectKey.length > 1_024 ||
    !input.objectKey.startsWith(prefix) ||
    input.objectKey.includes("\\") ||
    input.objectKey.includes("..") ||
    input.objectKey.includes("?") ||
    input.objectKey.includes("#") ||
    /[\u0000-\u001f\u007f]/u.test(input.objectKey)
  ) {
    throw new Error("That Studio clip belongs to another Product.");
  }
}
