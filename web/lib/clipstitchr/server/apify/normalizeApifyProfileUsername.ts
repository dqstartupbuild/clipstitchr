export function normalizeApifyProfileUsername(username: string) {
  return username.trim().replace(/^@+/, "");
}
