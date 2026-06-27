import type { TikTokSoundCandidate } from "@/lib/clipstitchr/types/TikTokSoundCandidate";

export function selectAutomaticTikTokSoundCandidate(
  candidates: TikTokSoundCandidate[],
) {
  return (
    candidates.find((candidate) => candidate.sourceUrl && candidate.playUrl) ??
    candidates.find((candidate) => candidate.sourceUrl) ??
    null
  );
}
