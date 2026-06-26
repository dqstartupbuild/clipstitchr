export function getTikTokItemString(item: unknown, key: string) {
  if (!item || typeof item !== "object") {
    return undefined;
  }

  const value = (item as Record<string, unknown>)[key];

  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
