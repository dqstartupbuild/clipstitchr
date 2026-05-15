export function createTikTokEventId(eventName: string) {
  const normalizedEventName =
    eventName.toLowerCase().replace(/[^a-z0-9]+/g, "_") || "event";

  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `cs_${normalizedEventName}_${crypto.randomUUID()}`;
  }

  return `cs_${normalizedEventName}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2)}`;
}
