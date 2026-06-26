export function getTikTokItemNumber(item: unknown, key: string) {
  if (!item || typeof item !== "object") {
    return undefined;
  }

  const value = (item as Record<string, unknown>)[key];

  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}
