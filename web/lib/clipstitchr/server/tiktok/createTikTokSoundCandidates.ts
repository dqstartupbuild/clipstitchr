import type { TikTokSoundCandidate } from "@/lib/clipstitchr/types/TikTokSoundCandidate";
import { createTikTokSoundCandidate } from "@/lib/clipstitchr/server/tiktok/createTikTokSoundCandidate";

export function createTikTokSoundCandidates(items: unknown[]) {
  const candidatesByKey = new Map<string, TikTokSoundCandidate>();

  for (const item of items) {
    const candidate = createTikTokSoundCandidate(item);

    if (!candidate) {
      continue;
    }

    const key =
      candidate.musicId ??
      `${candidate.title.toLowerCase()}:${candidate.author?.toLowerCase() ?? ""}`;
    const existing = candidatesByKey.get(key);

    if (!existing || (candidate.playCount ?? 0) > (existing.playCount ?? 0)) {
      candidatesByKey.set(key, candidate);
    }
  }

  return [...candidatesByKey.values()]
    .sort((left, right) => (right.playCount ?? 0) - (left.playCount ?? 0))
    .slice(0, 10);
}
