export function createUserR2KeyPrefix(userId: string) {
  return `users/${encodeURIComponent(userId)}/`;
}
