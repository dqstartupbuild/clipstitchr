export function assertSocialAssetObjectKeyBelongsToOwner(
  objectKey: string,
  ownerId: string,
) {
  const ownerPrefix = `users/${encodeURIComponent(ownerId)}/`;

  if (!objectKey.startsWith(ownerPrefix)) {
    throw new Error("Social post media is outside your account.");
  }
}
