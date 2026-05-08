export function normalizeReplicateApiToken(token: string | null | undefined) {
  return token?.trim() ?? "";
}
