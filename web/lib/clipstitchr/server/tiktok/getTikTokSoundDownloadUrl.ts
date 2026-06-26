import { getTikTokItemString } from "@/lib/clipstitchr/server/tiktok/getTikTokItemString";
import { getTikTokMusicMetaString } from "@/lib/clipstitchr/server/tiktok/getTikTokMusicMetaString";

export function getTikTokSoundDownloadUrl(item: unknown) {
  const directUrl =
    getTikTokMusicMetaString(item, "playUrl") ??
    getTikTokMusicMetaString(item, "originalPlayUrl") ??
    getTikTokMusicMetaString(item, "url") ??
    getTikTokItemString(item, "musicUrl") ??
    getTikTokItemString(item, "downloadAddr") ??
    getTikTokItemString(item, "originalDownloadAddr");

  if (directUrl) {
    return directUrl;
  }

  if (!item || typeof item !== "object") {
    return undefined;
  }

  const mediaUrls = (item as Record<string, unknown>).mediaUrls;

  if (!Array.isArray(mediaUrls)) {
    return undefined;
  }

  return mediaUrls.find(
    (mediaUrl): mediaUrl is string =>
      typeof mediaUrl === "string" && mediaUrl.trim().length > 0,
  );
}
