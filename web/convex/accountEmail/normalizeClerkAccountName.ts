export function normalizeClerkAccountName(value: string | null | undefined) {
  const normalized = value?.trim().replace(/\s+/g, " ") ?? "";

  return normalized || undefined;
}
