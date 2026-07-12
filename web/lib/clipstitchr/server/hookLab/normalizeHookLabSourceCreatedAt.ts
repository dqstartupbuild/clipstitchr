export function normalizeHookLabSourceCreatedAt(value?: string) {
  if (!value) {
    return undefined;
  }

  const numericValue = Number(value);
  const date = Number.isFinite(numericValue)
    ? new Date(numericValue < 10_000_000_000 ? numericValue * 1000 : numericValue)
    : new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}
