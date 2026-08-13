export function truncateLazyReelProductField(value: string | undefined, limit: number) {
  const normalized = value?.trim() ?? "";

  return normalized.length <= limit
    ? normalized
    : `${normalized.slice(0, Math.max(0, limit - 1)).trimEnd()}…`;
}
