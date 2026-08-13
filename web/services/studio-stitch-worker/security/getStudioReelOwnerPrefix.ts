export function getStudioReelOwnerPrefix(ownerId: string) {
  return `users/${encodeURIComponent(ownerId)}/`;
}
