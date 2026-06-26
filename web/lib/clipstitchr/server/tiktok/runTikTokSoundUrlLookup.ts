import { runApifyActorDataset } from "@/lib/clipstitchr/server/apify/runApifyActorDataset";
import { createTikTokScraperUrlInput } from "@/lib/clipstitchr/server/tiktok/createTikTokScraperUrlInput";
import { createTikTokSoundCandidate } from "@/lib/clipstitchr/server/tiktok/createTikTokSoundCandidate";
import { tiktokScraperActorId } from "@/lib/clipstitchr/server/tiktok/tiktokScraperActorId";

export async function runTikTokSoundUrlLookup(url: string) {
  const items = await runApifyActorDataset({
    actorId: tiktokScraperActorId,
    input: createTikTokScraperUrlInput(url),
  });
  const candidate = items.map(createTikTokSoundCandidate).find(Boolean);

  if (!candidate) {
    throw new Error("I could not find a sound from that TikTok.");
  }

  return candidate;
}
