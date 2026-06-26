import { getTikTokItemString } from "@/lib/clipstitchr/server/tiktok/getTikTokItemString";

export function getTikTokMusicMetaString(item: unknown, key: string) {
  if (!item || typeof item !== "object") {
    return undefined;
  }

  const record = item as Record<string, unknown>;
  const flatValue = getTikTokItemString(item, `musicMeta.${key}`);

  if (flatValue) {
    return flatValue;
  }

  const musicMeta = record.musicMeta;

  if (!musicMeta || typeof musicMeta !== "object") {
    return undefined;
  }

  const nestedValue = (musicMeta as Record<string, unknown>)[key];

  return typeof nestedValue === "string" && nestedValue.trim()
    ? nestedValue.trim()
    : undefined;
}
