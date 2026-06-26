import type { TikTokSoundCandidate } from "@/lib/clipstitchr/types/TikTokSoundCandidate";
import { getTikTokItemNumber } from "@/lib/clipstitchr/server/tiktok/getTikTokItemNumber";
import { getTikTokItemString } from "@/lib/clipstitchr/server/tiktok/getTikTokItemString";
import { getTikTokMusicMetaString } from "@/lib/clipstitchr/server/tiktok/getTikTokMusicMetaString";
import { getTikTokSoundDownloadUrl } from "@/lib/clipstitchr/server/tiktok/getTikTokSoundDownloadUrl";
import { getTikTokVideoDuration } from "@/lib/clipstitchr/server/tiktok/getTikTokVideoDuration";

export function createTikTokSoundCandidate(
  item: unknown,
): TikTokSoundCandidate | null {
  const title =
    getTikTokMusicMetaString(item, "musicName") ??
    getTikTokMusicMetaString(item, "title") ??
    "TikTok sound";
  const author =
    getTikTokMusicMetaString(item, "musicAuthor") ??
    getTikTokMusicMetaString(item, "authorName");
  const sourceUrl =
    getTikTokItemString(item, "webVideoUrl") ??
    getTikTokItemString(item, "url");

  if (!sourceUrl) {
    return null;
  }

  return {
    author,
    coverUrl:
      getTikTokMusicMetaString(item, "coverMediumUrl") ??
      getTikTokMusicMetaString(item, "originalCoverMediumUrl"),
    durationSeconds: getTikTokVideoDuration(item),
    musicId: getTikTokMusicMetaString(item, "musicId"),
    playCount: getTikTokItemNumber(item, "playCount"),
    playUrl: getTikTokSoundDownloadUrl(item),
    sourceUrl,
    title,
    videoText: getTikTokItemString(item, "text"),
  };
}
