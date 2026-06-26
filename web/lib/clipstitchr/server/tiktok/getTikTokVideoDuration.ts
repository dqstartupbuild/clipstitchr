import { getTikTokItemNumber } from "@/lib/clipstitchr/server/tiktok/getTikTokItemNumber";

export function getTikTokVideoDuration(item: unknown) {
  if (!item || typeof item !== "object") {
    return undefined;
  }

  const flatDuration = getTikTokItemNumber(item, "videoMeta.duration");

  if (flatDuration) {
    return flatDuration;
  }

  const videoMeta = (item as Record<string, unknown>).videoMeta;

  if (!videoMeta || typeof videoMeta !== "object") {
    return undefined;
  }

  const nestedDuration = (videoMeta as Record<string, unknown>).duration;

  return typeof nestedDuration === "number" && Number.isFinite(nestedDuration)
    ? nestedDuration
    : undefined;
}
